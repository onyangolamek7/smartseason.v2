<?php

namespace App\Http\Requests\Field;

use App\Enums\FieldStage;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateFieldRequest extends FormRequest
{
    public function authorize(): bool { return $this->user()->isAdmin(); }

    public function rules(): array
    {
        return [
            'name'                  => ['sometimes', 'string', 'max:255'],
            'crop_type'             => ['sometimes', 'string', 'max:255'],
            'planting_date'         => ['sometimes', 'date'],
            'expected_harvest_date' => ['sometimes', 'nullable', 'date'],
            'stage'                 => ['sometimes', Rule::enum(FieldStage::class)],
            'assigned_agent_id'     => ['sometimes', 'nullable', 'exists:users,id'],
            'location'              => ['sometimes', 'nullable', 'string', 'max:255'],
            'area_hectares'         => ['sometimes', 'nullable', 'numeric', 'min:0.01'],
            'notes'                 => ['sometimes', 'nullable', 'string', 'max:2000'],
            'is_abandoned'          => ['sometimes', 'boolean'],
        ];
    }
}
