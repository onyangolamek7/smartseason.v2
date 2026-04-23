<?php

namespace App\Http\Controllers;

use App\Http\Requests\FieldUpdate\StoreFieldUpdateRequest;
use App\Models\Field;
use App\Models\FieldUpdate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FieldUpdateController extends Controller
{
    public function store(StoreFieldUpdateRequest $request, Field $field): JsonResponse
    {
        $user = $request->user();

        if ($user->isFieldAgent() && $field->assigned_agent_id !== $user->id) {
            abort(403, 'You are not assigned to this field.');
        }

        if ($field->is_abandoned) {
            abort(422, 'Cannot update an abandoned field.');
        }

        $validated = $request->validated();

        $update = FieldUpdate::create([
            'field_id'     => $field->id,
            'user_id'      => $user->id,
            'stage'        => $validated['stage'],
            'notes'        => $validated['notes'] ?? null,
            'health_score' => $validated['health_score'] ?? null,
        ]);

        // Advance field stage
        $field->update(['stage' => $validated['stage']]);

        $freshField = $field->fresh();

        return response()->json([
            'message' => 'Update submitted successfully.',
            'update'  => [
                'id'           => $update->id,
                'stage'        => $update->stage->value,
                'stage_label'  => $update->stage->label(),
                'notes'        => $update->notes,
                'health_score' => $update->health_score,
                'updated_by'   => $user->name,
                'created_at'   => $update->created_at->toDateTimeString(),
            ],
            'field_status'        => $freshField->status->value,
            'field_status_label'  => $freshField->status->label(),
            'field_status_reason' => $freshField->status_reason,
        ], 201);
    }

    public function index(Request $request, Field $field): JsonResponse
    {
        $user = $request->user();

        if ($user->isFieldAgent() && $field->assigned_agent_id !== $user->id) {
            abort(403, 'Access denied.');
        }

        $updates = $field->updates()
            ->with('user:id,name,role')
            ->paginate(20);

        return response()->json([
            'updates' => collect($updates->items())->map(fn($u) => [
                'id'           => $u->id,
                'stage'        => $u->stage->value,
                'stage_label'  => $u->stage->label(),
                'stage_emoji'  => $u->stage->emoji(),
                'notes'        => $u->notes,
                'health_score' => $u->health_score,
                'updated_by'   => $u->user?->name,
                'user_role'    => $u->user?->role->value,
                'created_at'   => $u->created_at->toDateTimeString(),
            ]),
            'meta' => [
                'current_page' => $updates->currentPage(),
                'last_page'    => $updates->lastPage(),
                'total'        => $updates->total(),
            ],
        ]);
    }
}
