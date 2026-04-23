<?php

namespace App\Http\Requests\Field;

use App\Enums\FieldStage;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreFieldRequest extends FormRequest
{
    public function authorize(): bool { return $this->user()->isAdmin(); }

    public function rules(): array
    {
        return [
            'name'                  => ['required', 'string', 'max:255'],
            'crop_type'             => ['required', 'string', 'max:255'],
            'planting_date'         => ['required', 'date', 'before_or_equal:today'],
            'expected_harvest_date' => ['nullable', 'date', 'after:planting_date'],
            'stage'                 => ['required', Rule::enum(FieldStage::class)],
            'assigned_agent_id'     => ['nullable', 'exists:users,id'],
            'location'              => ['nullable', 'string', 'max:255'],
            'area_hectares'         => ['nullable', 'numeric', 'min:0.01', 'max:999999'],
            'notes'                 => ['nullable', 'string', 'max:2000'],
        ];
    }
}
