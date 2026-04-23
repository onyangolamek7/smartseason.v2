<?php

namespace Database\Seeders;

use App\Enums\FieldStage;
use App\Enums\UserRole;
use App\Models\Field;
use App\Models\FieldUpdate;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ── Users ─────────────────────────────────────────────────────────────
        $admin = User::create([
            'name'     => 'Sarah Kimani',
            'email'    => 'admin@smartseason.com',
            'password' => Hash::make('Admin@1234'),
            'role'     => UserRole::Admin,
        ]);

        $james = User::create([
            'name'     => 'James Odhiambo',
            'email'    => 'james@smartseason.com',
            'password' => Hash::make('Agent@1234'),
            'role'     => UserRole::FieldAgent,
        ]);

        $grace = User::create([
            'name'     => 'Grace Wanjiku',
            'email'    => 'grace@smartseason.com',
            'password' => Hash::make('Agent@1234'),
            'role'     => UserRole::FieldAgent,
        ]);

        $david = User::create([
            'name'     => 'David Mwangi',
            'email'    => 'david@smartseason.com',
            'password' => Hash::make('Agent@1234'),
            'role'     => UserRole::FieldAgent,
        ]);

        // ── Fields — designed to demonstrate every status scenario ────────────

        // 1. ACTIVE — healthy growing field, recent updates
        $f1 = Field::create([
            'name'                  => 'Rift Valley — Block A',
            'crop_type'             => 'Maize',
            'planting_date'         => now()->subDays(45),
            'expected_harvest_date' => now()->addDays(75),
            'stage'                 => FieldStage::Growing,
            'assigned_agent_id'     => $james->id,
            'location'              => 'Eldoret, Rift Valley',
            'area_hectares'         => 12.5,
        ]);
        $this->seedUpdates($f1, $james->id, [
            ['stage' => FieldStage::Planted,    'days_ago' => 45, 'notes' => 'Seeds sown. Soil moisture excellent. Ready for germination.',           'health' => 8],
            ['stage' => FieldStage::Germinated, 'days_ago' => 35, 'notes' => 'Germination 92% success rate. Uniform crop emergence observed.',         'health' => 9],
            ['stage' => FieldStage::Growing,    'days_ago' => 5,  'notes' => 'Crop growing vigorously. Applied NPK fertiliser. No pest signs.',        'health' => 8],
        ]);

        // 2. ACTIVE — germinated, progressing well
        $f2 = Field::create([
            'name'                  => 'Rift Valley — Block B',
            'crop_type'             => 'Wheat',
            'planting_date'         => now()->subDays(12),
            'expected_harvest_date' => now()->addDays(88),
            'stage'                 => FieldStage::Germinated,
            'assigned_agent_id'     => $james->id,
            'location'              => 'Eldoret, Rift Valley',
            'area_hectares'         => 8.0,
        ]);
        $this->seedUpdates($f2, $james->id, [
            ['stage' => FieldStage::Planted,    'days_ago' => 12, 'notes' => 'Sowing complete. 8 ha covered. Irrigation scheduled.', 'health' => 7],
            ['stage' => FieldStage::Germinated, 'days_ago' => 3,  'notes' => 'Germination confirmed across all plots. Looking healthy.', 'health' => 8],
        ]);

        // 3. ACTIVE — flowering, on track
        $f3 = Field::create([
            'name'                  => 'Central Highlands — Plot 1',
            'crop_type'             => 'Tea',
            'planting_date'         => now()->subDays(110),
            'expected_harvest_date' => now()->addDays(20),
            'stage'                 => FieldStage::Flowering,
            'assigned_agent_id'     => $grace->id,
            'location'              => 'Nyeri, Central Kenya',
            'area_hectares'         => 5.2,
        ]);
        $this->seedUpdates($f3, $grace->id, [
            ['stage' => FieldStage::Planted,    'days_ago' => 110, 'notes' => 'Seedlings transplanted.',        'health' => 7],
            ['stage' => FieldStage::Germinated, 'days_ago' => 95,  'notes' => 'Good establishment observed.',   'health' => 7],
            ['stage' => FieldStage::Growing,    'days_ago' => 60,  'notes' => 'Steady growth. Weeding done.',   'health' => 8],
            ['stage' => FieldStage::Flowering,  'days_ago' => 4,   'notes' => 'Flowering begun. Looks great.',  'health' => 9],
        ]);

        // 4. COMPLETED — harvested
        $f4 = Field::create([
            'name'                  => 'Central Highlands — Plot 2',
            'crop_type'             => 'Coffee',
            'planting_date'         => now()->subDays(240),
            'expected_harvest_date' => now()->subDays(10),
            'stage'                 => FieldStage::Harvested,
            'assigned_agent_id'     => $grace->id,
            'location'              => 'Nyeri, Central Kenya',
            'area_hectares'         => 3.8,
        ]);
        $this->seedUpdates($f4, $grace->id, [
            ['stage' => FieldStage::Planted,    'days_ago' => 240, 'notes' => 'Seeds planted.',                              'health' => 7],
            ['stage' => FieldStage::Growing,    'days_ago' => 180, 'notes' => 'Healthy growth.',                             'health' => 8],
            ['stage' => FieldStage::Maturing,   'days_ago' => 60,  'notes' => 'Berries forming. Quality looks excellent.',  'health' => 9],
            ['stage' => FieldStage::Ready,      'days_ago' => 20,  'notes' => 'Crop ready for harvest.',                    'health' => 9],
            ['stage' => FieldStage::Harvested,  'days_ago' => 10,  'notes' => 'Harvest complete. 4.1 tonnes. Above target.','health' => 10],
        ]);

        // 5. AT RISK — ready to harvest but no update in 7+ days
        $f5 = Field::create([
            'name'                  => 'Nyanza — Section 1',
            'crop_type'             => 'Rice',
            'planting_date'         => now()->subDays(120),
            'expected_harvest_date' => now()->addDays(3),
            'stage'                 => FieldStage::Ready,
            'assigned_agent_id'     => $david->id,
            'location'              => 'Kisumu, Nyanza',
            'area_hectares'         => 20.0,
        ]);
        $this->seedUpdates($f5, $david->id, [
            ['stage' => FieldStage::Planted,   'days_ago' => 120, 'notes' => 'Paddy sown.',                    'health' => 7],
            ['stage' => FieldStage::Growing,   'days_ago' => 80,  'notes' => 'Growing well. Flooded paddies.', 'health' => 8],
            ['stage' => FieldStage::Maturing,  'days_ago' => 30,  'notes' => 'Grain filling in progress.',     'health' => 8],
            ['stage' => FieldStage::Ready,     'days_ago' => 8,   'notes' => 'Crop fully matured, ready.',     'health' => 9],
            // No update since — 8 days stale on a "ready" field → AT RISK
        ]);

        // 6. AT RISK — no agent assigned
        $f6 = Field::create([
            'name'                  => 'Eastern — Unassigned Plot',
            'crop_type'             => 'Sorghum',
            'planting_date'         => now()->subDays(25),
            'expected_harvest_date' => now()->addDays(65),
            'stage'                 => FieldStage::Planted,
            'assigned_agent_id'     => null,
            'location'              => 'Machakos, Eastern',
            'area_hectares'         => 7.5,
        ]);
        // No updates — no agent assigned → AT RISK

        // 7. AT RISK — harvest approaching in 5 days, still maturing
        $f7 = Field::create([
            'name'                  => 'Coast Region — Farm A',
            'crop_type'             => 'Cassava',
            'planting_date'         => now()->subDays(280),
            'expected_harvest_date' => now()->addDays(5),
            'stage'                 => FieldStage::Maturing,
            'assigned_agent_id'     => $david->id,
            'location'              => 'Kilifi, Coast',
            'area_hectares'         => 6.0,
        ]);
        $this->seedUpdates($f7, $david->id, [
            ['stage' => FieldStage::Planted,   'days_ago' => 280, 'notes' => 'Cuttings planted.',         'health' => 7],
            ['stage' => FieldStage::Growing,   'days_ago' => 200, 'notes' => 'Good canopy development.',  'health' => 8],
            ['stage' => FieldStage::Flowering, 'days_ago' => 90,  'notes' => 'Flowering observed.',       'health' => 7],
            ['stage' => FieldStage::Maturing,  'days_ago' => 20,  'notes' => 'Tubers forming well.',      'health' => 7],
            // harvest in 5 days but not yet Ready → AT RISK
        ]);

        // 8. CRITICAL — expected harvest date has already passed
        $f8 = Field::create([
            'name'                  => 'Rift Valley — Block C (Overdue)',
            'crop_type'             => 'Barley',
            'planting_date'         => now()->subDays(160),
            'expected_harvest_date' => now()->subDays(5),
            'stage'                 => FieldStage::Maturing,
            'assigned_agent_id'     => $james->id,
            'location'              => 'Nakuru, Rift Valley',
            'area_hectares'         => 9.0,
        ]);
        $this->seedUpdates($f8, $james->id, [
            ['stage' => FieldStage::Planted,   'days_ago' => 160, 'notes' => 'Seeds in ground.',         'health' => 7],
            ['stage' => FieldStage::Growing,   'days_ago' => 100, 'notes' => 'Growing steadily.',         'health' => 7],
            ['stage' => FieldStage::Flowering, 'days_ago' => 50,  'notes' => 'Flowering commenced.',      'health' => 6],
            ['stage' => FieldStage::Maturing,  'days_ago' => 20,  'notes' => 'Maturing. Some lodging.',   'health' => 5],
            // harvest date passed 5 days ago → CRITICAL
        ]);

        // 9. CRITICAL — ready for 14+ days, missed harvest window
        $f9 = Field::create([
            'name'                  => 'Nyanza — Section 2 (Missed Harvest)',
            'crop_type'             => 'Sugarcane',
            'planting_date'         => now()->subDays(365),
            'expected_harvest_date' => now()->subDays(20),
            'stage'                 => FieldStage::Ready,
            'assigned_agent_id'     => $grace->id,
            'location'              => 'Kisumu, Nyanza',
            'area_hectares'         => 15.0,
        ]);
        $this->seedUpdates($f9, $grace->id, [
            ['stage' => FieldStage::Growing,  'days_ago' => 200, 'notes' => 'Cane growing tall.',      'health' => 8],
            ['stage' => FieldStage::Maturing, 'days_ago' => 60,  'notes' => 'Sugar content rising.',   'health' => 8],
            ['stage' => FieldStage::Ready,    'days_ago' => 20,  'notes' => 'Ready for cut.',          'health' => 8],
            // 20 days stale on a "ready" field (threshold: 14 days) → CRITICAL
        ]);

        // 10. ABANDONED
        $f10 = Field::create([
            'name'                  => 'Eastern — Abandoned Plot',
            'crop_type'             => 'Millet',
            'planting_date'         => now()->subDays(90),
            'expected_harvest_date' => now()->addDays(30),
            'stage'                 => FieldStage::Growing,
            'assigned_agent_id'     => null,
            'location'              => 'Kitui, Eastern',
            'area_hectares'         => 4.0,
            'is_abandoned'          => true,
            'notes'                 => 'Abandoned due to severe drought damage. Plot to be reassessed next season.',
        ]);

        // 11. ACTIVE — maturing nicely
        $f11 = Field::create([
            'name'                  => 'Western — Sunflower Farm',
            'crop_type'             => 'Sunflower',
            'planting_date'         => now()->subDays(70),
            'expected_harvest_date' => now()->addDays(30),
            'stage'                 => FieldStage::Maturing,
            'assigned_agent_id'     => $david->id,
            'location'              => 'Kakamega, Western',
            'area_hectares'         => 11.0,
        ]);
        $this->seedUpdates($f11, $david->id, [
            ['stage' => FieldStage::Planted,   'days_ago' => 70, 'notes' => 'Direct seeding complete.',        'health' => 8],
            ['stage' => FieldStage::Growing,   'days_ago' => 45, 'notes' => 'Rapid vegetative growth.',        'health' => 8],
            ['stage' => FieldStage::Flowering, 'days_ago' => 20, 'notes' => 'Full flowering. Bees active.',    'health' => 9],
            ['stage' => FieldStage::Maturing,  'days_ago' => 3,  'notes' => 'Heads forming well. On track.',  'health' => 8],
        ]);

        // 12. ACTIVE — recently planted, all fine
        $f12 = Field::create([
            'name'                  => 'North Rift — New Plot',
            'crop_type'             => 'Potatoes',
            'planting_date'         => now()->subDays(7),
            'expected_harvest_date' => now()->addDays(83),
            'stage'                 => FieldStage::Planted,
            'assigned_agent_id'     => $james->id,
            'location'              => 'Nanyuki, Laikipia',
            'area_hectares'         => 3.5,
        ]);
        $this->seedUpdates($f12, $james->id, [
            ['stage' => FieldStage::Planted, 'days_ago' => 7, 'notes' => 'Seed potatoes planted at 30cm spacing. Soil well-prepared.', 'health' => 8],
        ]);
    }

    private function seedUpdates(Field $field, int $userId, array $updates): void
    {
        foreach ($updates as $u) {
            $ts = now()->subDays($u['days_ago']);
            FieldUpdate::create([
                'field_id'     => $field->id,
                'user_id'      => $userId,
                'stage'        => $u['stage'],
                'notes'        => $u['notes'],
                'health_score' => $u['health'],
                'created_at'   => $ts,
                'updated_at'   => $ts,
            ]);
        }
    }
}
