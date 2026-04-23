<?php

namespace App\Http\Controllers;

use App\Enums\FieldStage;
use App\Enums\FieldStatus;
use App\Models\Field;
use App\Models\FieldUpdate;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        return $request->user()->isAdmin()
            ? $this->adminDashboard()
            : $this->agentDashboard($request->user());
    }

    // ─── Admin Dashboard ──────────────────────────────────────────────────────

    private function adminDashboard(): JsonResponse
    {
        // Load latestUpdate AND updates so getStageDays() can use in-memory collection
        $fields = Field::with([
            'assignedAgent:id,name',
            'latestUpdate',
            'updates',
        ])->get();

        // Status breakdown
        $statusBreakdown = array_fill_keys(FieldStatus::values(), 0);
        foreach ($fields as $f) {
            $statusBreakdown[$f->status->value]++;
        }

        // Stage breakdown
        $stageBreakdown = array_fill_keys(FieldStage::values(), 0);
        foreach ($fields as $f) {
            $stageBreakdown[$f->stage->value]++;
        }

        // Crop type distribution
        $cropBreakdown = $fields->groupBy('crop_type')
            ->map(fn($g) => $g->count())
            ->sortByDesc(fn($v) => $v)
            ->take(8)
            ->toArray();

        // Alert fields (at_risk, critical, abandoned)
        $alertFields = $fields
            ->filter(fn($f) => in_array($f->status->value, ['at_risk', 'critical', 'abandoned']))
            ->map(fn($f) => [
                'id'            => $f->id,
                'name'          => $f->name,
                'status'        => $f->status->value,
                'status_label'  => $f->status->label(),
                'status_reason' => $f->status_reason,
                'stage'         => $f->stage->value,
                'stage_label'   => $f->stage->label(),
                'agent'         => $f->assignedAgent?->name ?? 'Unassigned',
                'crop_type'     => $f->crop_type,
            ])
            ->values();

        // Upcoming harvests (next 14 days)
        $now = now();
        $upcomingHarvests = $fields
            ->filter(fn($f) => $f->expected_harvest_date
                && $f->expected_harvest_date->gt($now)
                && $f->expected_harvest_date->diffInDays($now) <= 14
                && $f->stage !== FieldStage::Harvested
            )
            ->sortBy('expected_harvest_date')
            ->map(fn($f) => [
                'id'                    => $f->id,
                'name'                  => $f->name,
                'crop_type'             => $f->crop_type,
                'expected_harvest_date' => $f->expected_harvest_date->toDateString(),
                'days_to_harvest'       => $f->days_to_harvest,
                'stage'                 => $f->stage->value,
                'stage_label'           => $f->stage->label(),
                'agent'                 => $f->assignedAgent?->name,
            ])
            ->values();

        // Recent updates
        $recentUpdates = FieldUpdate::with(['field:id,name', 'user:id,name'])
            ->latest()->limit(10)->get()
            ->map(fn($u) => [
                'id'           => $u->id,
                'field_id'     => $u->field_id,
                'field_name'   => $u->field?->name,
                'stage'        => $u->stage->value,
                'stage_label'  => $u->stage->label(),
                'stage_emoji'  => $u->stage->emoji(),
                'notes'        => $u->notes,
                'health_score' => $u->health_score,
                'updated_by'   => $u->user?->name,
                'created_at'   => $u->created_at->toDateTimeString(),
            ]);

        // Agent workload
        $agentStats = User::where('role', 'field_agent')
            ->withCount('fields')
            ->orderBy('fields_count', 'desc')
            ->get()
            ->map(fn($a) => [
                'id'           => $a->id,
                'name'         => $a->name,
                'fields_count' => $a->fields_count,
            ]);

        $totalArea = $fields->sum('area_hectares');

        return response()->json([
            'summary' => [
                'total_fields'      => $fields->count(),
                'total_agents'      => User::where('role', 'field_agent')->count(),
                'critical_fields'   => $statusBreakdown[FieldStatus::Critical->value],
                'at_risk_fields'    => $statusBreakdown[FieldStatus::AtRisk->value],
                'active_fields'     => $statusBreakdown[FieldStatus::Active->value],
                'completed_fields'  => $statusBreakdown[FieldStatus::Completed->value],
                'abandoned_fields'  => $statusBreakdown[FieldStatus::Abandoned->value],
                'unassigned_fields' => $fields->whereNull('assigned_agent_id')->count(),
                'total_area_ha'     => round($totalArea, 2),
                'upcoming_harvests' => $upcomingHarvests->count(),
            ],
            'status_breakdown'  => $statusBreakdown,
            'stage_breakdown'   => $stageBreakdown,
            'crop_breakdown'    => $cropBreakdown,
            'alert_fields'      => $alertFields,
            'upcoming_harvests' => $upcomingHarvests,
            'recent_updates'    => $recentUpdates,
            'agent_stats'       => $agentStats,
        ]);
    }

    // ─── Agent Dashboard ──────────────────────────────────────────────────────

    private function agentDashboard(User $agent): JsonResponse
    {
        $fields = Field::where('assigned_agent_id', $agent->id)
            ->with(['latestUpdate', 'updates'])
            ->get();

        $statusBreakdown = array_fill_keys(FieldStatus::values(), 0);
        $stageBreakdown  = array_fill_keys(FieldStage::values(), 0);
        foreach ($fields as $f) {
            $statusBreakdown[$f->status->value]++;
            $stageBreakdown[$f->stage->value]++;
        }

        // Fields needing action
        $needsAction = $fields
            ->filter(fn($f) => in_array($f->status->value, ['at_risk', 'critical']))
            ->map(fn($f) => [
                'id'            => $f->id,
                'name'          => $f->name,
                'status'        => $f->status->value,
                'status_label'  => $f->status->label(),
                'status_reason' => $f->status_reason,
                'stage'         => $f->stage->value,
                'stage_label'   => $f->stage->label(),
                'crop_type'     => $f->crop_type,
            ])
            ->values();

        // Upcoming harvests
        $now = now();
        $upcomingHarvests = $fields
            ->filter(fn($f) => $f->expected_harvest_date
                && $f->expected_harvest_date->gt($now)
                && $f->expected_harvest_date->diffInDays($now) <= 14
                && $f->stage !== FieldStage::Harvested
            )
            ->sortBy('expected_harvest_date')
            ->map(fn($f) => [
                'id'                    => $f->id,
                'name'                  => $f->name,
                'crop_type'             => $f->crop_type,
                'expected_harvest_date' => $f->expected_harvest_date->toDateString(),
                'days_to_harvest'       => $f->days_to_harvest,
            ])
            ->values();

        // Agent's recent updates
        $recentUpdates = FieldUpdate::where('user_id', $agent->id)
            ->with(['field:id,name'])
            ->latest()->limit(8)->get()
            ->map(fn($u) => [
                'id'          => $u->id,
                'field_id'    => $u->field_id,
                'field_name'  => $u->field?->name,
                'stage'       => $u->stage->value,
                'stage_label' => $u->stage->label(),
                'stage_emoji' => $u->stage->emoji(),
                'notes'       => $u->notes,
                'created_at'  => $u->created_at->toDateTimeString(),
            ]);

        $avgHealth = $fields
            ->map(fn($f) => $f->latestUpdate?->health_score)
            ->filter()
            ->avg();

        return response()->json([
            'summary' => [
                'total_fields'      => $fields->count(),
                'active_fields'     => $statusBreakdown[FieldStatus::Active->value],
                'at_risk_fields'    => $statusBreakdown[FieldStatus::AtRisk->value],
                'critical_fields'   => $statusBreakdown[FieldStatus::Critical->value],
                'completed_fields'  => $statusBreakdown[FieldStatus::Completed->value],
                'ready_to_harvest'  => $stageBreakdown[FieldStage::Ready->value],
                'upcoming_harvests' => $upcomingHarvests->count(),
                'avg_health_score'  => $avgHealth ? round($avgHealth, 1) : null,
                'total_area_ha'     => round($fields->sum('area_hectares'), 2),
            ],
            'status_breakdown'  => $statusBreakdown,
            'stage_breakdown'   => $stageBreakdown,
            'needs_action'      => $needsAction,
            'upcoming_harvests' => $upcomingHarvests,
            'recent_updates'    => $recentUpdates,
        ]);
    }
}
