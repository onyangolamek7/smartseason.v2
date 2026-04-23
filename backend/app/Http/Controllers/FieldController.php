<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Http\Requests\Field\StoreFieldRequest;
use App\Http\Requests\Field\UpdateFieldRequest;
use App\Models\Field;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FieldController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user  = $request->user();
        $query = Field::with([
            'assignedAgent:id,name,email',
            'latestUpdate',
            'latestUpdate.user:id,name',
        ])->orderBy('created_at', 'desc');

        if ($user->isFieldAgent()) {
            $query->where('assigned_agent_id', $user->id);
        }

        $fields = $query->get()->map(fn($f) => $this->format($f));

        return response()->json(['fields' => $fields]);
    }

    public function store(StoreFieldRequest $request): JsonResponse
    {
        $this->requireAdmin($request);
        $field = Field::create($request->validated());
        $field->load(['assignedAgent:id,name,email', 'latestUpdate']);
        return response()->json([
            'message' => 'Field created successfully.',
            'field'   => $this->format($field),
        ], 201);
    }

    public function show(Request $request, Field $field): JsonResponse
    {
        $this->requireFieldAccess($request->user(), $field);
        $field->load([
            'assignedAgent:id,name,email',
            'latestUpdate',
            'updates',
            'updates.user:id,name,role',
        ]);
        return response()->json(['field' => $this->format($field, true)]);
    }

    public function update(UpdateFieldRequest $request, Field $field): JsonResponse
    {
        $this->requireAdmin($request);
        $field->update($request->validated());
        $field->load(['assignedAgent:id,name,email', 'latestUpdate']);
        return response()->json([
            'message' => 'Field updated successfully.',
            'field'   => $this->format($field),
        ]);
    }

    public function destroy(Request $request, Field $field): JsonResponse
    {
        $this->requireAdmin($request);
        $field->delete();
        return response()->json(['message' => 'Field deleted.']);
    }

    public function abandon(Request $request, Field $field): JsonResponse
    {
        $this->requireAdmin($request);
        $field->update(['is_abandoned' => true]);
        $field->load(['assignedAgent:id,name,email', 'latestUpdate']);
        return response()->json([
            'message' => 'Field marked as abandoned.',
            'field'   => $this->format($field),
        ]);
    }

    public function restore(Request $request, Field $field): JsonResponse
    {
        $this->requireAdmin($request);
        $field->update(['is_abandoned' => false]);
        $field->load(['assignedAgent:id,name,email', 'latestUpdate']);
        return response()->json([
            'message' => 'Field restored.',
            'field'   => $this->format($field),
        ]);
    }

    public function agents(Request $request): JsonResponse
    {
        $this->requireAdmin($request);
        $agents = User::where('role', UserRole::FieldAgent)
            ->select('id', 'name', 'email')
            ->orderBy('name')
            ->get();
        return response()->json(['agents' => $agents]);
    }

    // ─── Formatter ───────────────────────────────────────────────────────────

    private function format(Field $field, bool $withUpdates = false): array
    {
        $latest = $field->latestUpdate;

        $data = [
            'id'                    => $field->id,
            'name'                  => $field->name,
            'crop_type'             => $field->crop_type,
            'planting_date'         => $field->planting_date?->toDateString(),
            'expected_harvest_date' => $field->expected_harvest_date?->toDateString(),
            'days_to_harvest'       => $field->days_to_harvest,
            'stage'                 => $field->stage->value,
            'stage_label'           => $field->stage->label(),
            'stage_emoji'           => $field->stage->emoji(),
            'stage_order'           => $field->stage->order(),
            'status'                => $field->status->value,
            'status_label'          => $field->status->label(),
            'status_reason'         => $field->status_reason,
            'location'              => $field->location,
            'area_hectares'         => $field->area_hectares,
            'notes'                 => $field->notes,
            'is_abandoned'          => $field->is_abandoned,
            'days_since_planting'   => $field->days_active_since_planting,
            'assigned_agent'        => $field->assignedAgent ? [
                'id'    => $field->assignedAgent->id,
                'name'  => $field->assignedAgent->name,
                'email' => $field->assignedAgent->email,
            ] : null,
            'latest_update' => $latest ? [
                'id'           => $latest->id,
                'stage'        => $latest->stage->value,
                'stage_label'  => $latest->stage->label(),
                'notes'        => $latest->notes,
                'health_score' => $latest->health_score,
                'updated_by'   => $latest->user?->name,
                'created_at'   => $latest->created_at?->toDateTimeString(),
            ] : null,
            'created_at' => $field->created_at?->toDateTimeString(),
            'updated_at' => $field->updated_at?->toDateTimeString(),
        ];

        if ($withUpdates) {
            $data['updates'] = $field->updates->sortByDesc('created_at')->map(fn($u) => [
                'id'           => $u->id,
                'stage'        => $u->stage->value,
                'stage_label'  => $u->stage->label(),
                'stage_emoji'  => $u->stage->emoji(),
                'notes'        => $u->notes,
                'health_score' => $u->health_score,
                'updated_by'   => $u->user?->name,
                'user_role'    => $u->user?->role->value,
                'created_at'   => $u->created_at?->toDateTimeString(),
            ])->values();
        }

        return $data;
    }

    // ─── Guards ──────────────────────────────────────────────────────────────

    private function requireAdmin(Request $request): void
    {
        if (! $request->user()->isAdmin()) abort(403, 'Admin access required.');
    }

    private function requireFieldAccess(User $user, Field $field): void
    {
        if ($user->isAdmin()) return;
        if ($field->assigned_agent_id !== $user->id) abort(403, 'Access denied.');
    }
}
