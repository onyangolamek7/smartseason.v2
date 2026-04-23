<?php

namespace App\Http\Requests\FieldUpdate;

use App\Enums\FieldStage;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreFieldUpdateRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'stage'        => ['required', Rule::enum(FieldStage::class)],
            'notes'        => ['nullable', 'string', 'max:2000'],
            'health_score' => ['nullable', 'integer', 'min:1', 'max:10'],
        ];
    }
}
