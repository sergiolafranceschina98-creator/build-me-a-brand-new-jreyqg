import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { eq } from 'drizzle-orm';
import * as schema from '../db/schema/schema.js';
import type { App } from '../index.js';

interface GenerateProgramBody {
  clientId?: string;
  client_id?: string;
}

interface GetClientProgramsParams {
  client_id: string;
}

interface DeleteProgramParams {
  id: string;
}

interface Exercise {
  name: string;
  sets: number;
  reps: string;
  weight?: string;
  tempo?: string;
  restSeconds?: number;
  rpe?: string;
  notes?: string;
  [key: string]: any;
}

interface Week {
  weekNumber: number;
  focus: string;
  exercises: Exercise[];
  [key: string]: any;
}

interface ProgramData {
  weeks: Week[];
  deloadWeek?: number;
  progressionStrategy: string;
  notes?: string;
  [key: string]: any;
}

// Exercise database organized by category
const EXERCISE_DATABASE = {
  push: {
    chest: [
      { name: 'Barbell Bench Press', equipment: ['Commercial Gym', 'Home Gym'], difficulty: ['Intermediate', 'Advanced'] },
      { name: 'Dumbbell Bench Press', equipment: ['Commercial Gym', 'Home Gym', 'Dumbbells Only'], difficulty: ['Beginner', 'Intermediate', 'Advanced'] },
      { name: 'Incline Barbell Press', equipment: ['Commercial Gym', 'Home Gym'], difficulty: ['Intermediate', 'Advanced'] },
      { name: 'Incline Dumbbell Press', equipment: ['Commercial Gym', 'Home Gym', 'Dumbbells Only'], difficulty: ['Beginner', 'Intermediate', 'Advanced'] },
      { name: 'Dips', equipment: ['Commercial Gym', 'Home Gym', 'Bodyweight Only'], difficulty: ['Intermediate', 'Advanced'] },
      { name: 'Push-ups', equipment: ['Commercial Gym', 'Home Gym', 'Dumbbells Only', 'Bodyweight Only'], difficulty: ['Beginner', 'Intermediate', 'Advanced'] },
      { name: 'Decline Push-ups', equipment: ['Commercial Gym', 'Home Gym', 'Bodyweight Only'], difficulty: ['Intermediate', 'Advanced'] },
      { name: 'Cable Flyes', equipment: ['Commercial Gym'], difficulty: ['Intermediate', 'Advanced'] },
      { name: 'Pec Deck Machine', equipment: ['Commercial Gym'], difficulty: ['Beginner', 'Intermediate'] },
    ],
    shoulders: [
      { name: 'Overhead Press', equipment: ['Commercial Gym', 'Home Gym', 'Dumbbells Only'], difficulty: ['Intermediate', 'Advanced'] },
      { name: 'Dumbbell Shoulder Press', equipment: ['Commercial Gym', 'Home Gym', 'Dumbbells Only'], difficulty: ['Beginner', 'Intermediate', 'Advanced'] },
      { name: 'Lateral Raises', equipment: ['Commercial Gym', 'Home Gym', 'Dumbbells Only'], difficulty: ['Beginner', 'Intermediate', 'Advanced'] },
      { name: 'Front Raises', equipment: ['Commercial Gym', 'Home Gym', 'Dumbbells Only'], difficulty: ['Beginner', 'Intermediate', 'Advanced'] },
      { name: 'Face Pulls', equipment: ['Commercial Gym'], difficulty: ['Beginner', 'Intermediate', 'Advanced'] },
      { name: 'Arnold Press', equipment: ['Commercial Gym', 'Home Gym', 'Dumbbells Only'], difficulty: ['Intermediate', 'Advanced'] },
      { name: 'Machine Shoulder Press', equipment: ['Commercial Gym'], difficulty: ['Beginner', 'Intermediate'] },
    ],
    triceps: [
      { name: 'Close-Grip Bench Press', equipment: ['Commercial Gym', 'Home Gym'], difficulty: ['Intermediate', 'Advanced'] },
      { name: 'Tricep Dips', equipment: ['Commercial Gym', 'Home Gym', 'Bodyweight Only'], difficulty: ['Intermediate', 'Advanced'] },
      { name: 'Overhead Tricep Extension', equipment: ['Commercial Gym', 'Home Gym', 'Dumbbells Only'], difficulty: ['Beginner', 'Intermediate', 'Advanced'] },
      { name: 'Tricep Pushdowns', equipment: ['Commercial Gym'], difficulty: ['Beginner', 'Intermediate', 'Advanced'] },
      { name: 'Skull Crushers', equipment: ['Commercial Gym', 'Home Gym'], difficulty: ['Intermediate', 'Advanced'] },
      { name: 'Dumbbell Tricep Extensions', equipment: ['Commercial Gym', 'Home Gym', 'Dumbbells Only'], difficulty: ['Beginner', 'Intermediate', 'Advanced'] },
    ],
  },
  pull: {
    back: [
      { name: 'Barbell Rows', equipment: ['Commercial Gym', 'Home Gym'], difficulty: ['Intermediate', 'Advanced'] },
      { name: 'Dumbbell Rows', equipment: ['Commercial Gym', 'Home Gym', 'Dumbbells Only'], difficulty: ['Beginner', 'Intermediate', 'Advanced'] },
      { name: 'Pull-ups', equipment: ['Commercial Gym', 'Home Gym', 'Bodyweight Only'], difficulty: ['Intermediate', 'Advanced'] },
      { name: 'Lat Pulldowns', equipment: ['Commercial Gym'], difficulty: ['Beginner', 'Intermediate', 'Advanced'] },
      { name: 'Seated Cable Rows', equipment: ['Commercial Gym'], difficulty: ['Beginner', 'Intermediate', 'Advanced'] },
      { name: 'T-Bar Rows', equipment: ['Commercial Gym', 'Home Gym'], difficulty: ['Intermediate', 'Advanced'] },
      { name: 'Deadlifts', equipment: ['Commercial Gym', 'Home Gym'], difficulty: ['Intermediate', 'Advanced'] },
      { name: 'Machine Rows', equipment: ['Commercial Gym'], difficulty: ['Beginner', 'Intermediate'] },
    ],
    biceps: [
      { name: 'Barbell Curls', equipment: ['Commercial Gym', 'Home Gym'], difficulty: ['Intermediate', 'Advanced'] },
      { name: 'Dumbbell Curls', equipment: ['Commercial Gym', 'Home Gym', 'Dumbbells Only'], difficulty: ['Beginner', 'Intermediate', 'Advanced'] },
      { name: 'Hammer Curls', equipment: ['Commercial Gym', 'Home Gym', 'Dumbbells Only'], difficulty: ['Beginner', 'Intermediate', 'Advanced'] },
      { name: 'Preacher Curls', equipment: ['Commercial Gym'], difficulty: ['Beginner', 'Intermediate', 'Advanced'] },
      { name: 'Cable Curls', equipment: ['Commercial Gym'], difficulty: ['Beginner', 'Intermediate', 'Advanced'] },
      { name: 'EZ-Bar Curls', equipment: ['Commercial Gym', 'Home Gym'], difficulty: ['Intermediate', 'Advanced'] },
    ],
    rearDelts: [
      { name: 'Face Pulls', equipment: ['Commercial Gym'], difficulty: ['Beginner', 'Intermediate', 'Advanced'] },
      { name: 'Reverse Flyes', equipment: ['Commercial Gym'], difficulty: ['Beginner', 'Intermediate', 'Advanced'] },
      { name: 'Rear Delt Rows', equipment: ['Commercial Gym', 'Home Gym'], difficulty: ['Intermediate', 'Advanced'] },
      { name: 'Cable Reverse Flyes', equipment: ['Commercial Gym'], difficulty: ['Beginner', 'Intermediate'] },
    ],
  },
  legs: {
    quads: [
      { name: 'Barbell Squats', equipment: ['Commercial Gym', 'Home Gym'], difficulty: ['Intermediate', 'Advanced'] },
      { name: 'Front Squats', equipment: ['Commercial Gym', 'Home Gym'], difficulty: ['Intermediate', 'Advanced'] },
      { name: 'Leg Press', equipment: ['Commercial Gym'], difficulty: ['Beginner', 'Intermediate', 'Advanced'] },
      { name: 'Bulgarian Split Squats', equipment: ['Commercial Gym', 'Home Gym', 'Dumbbells Only', 'Bodyweight Only'], difficulty: ['Intermediate', 'Advanced'] },
      { name: 'Goblet Squats', equipment: ['Commercial Gym', 'Home Gym', 'Dumbbells Only'], difficulty: ['Beginner', 'Intermediate', 'Advanced'] },
      { name: 'Lunges', equipment: ['Commercial Gym', 'Home Gym', 'Dumbbells Only', 'Bodyweight Only'], difficulty: ['Beginner', 'Intermediate', 'Advanced'] },
      { name: 'Leg Extensions', equipment: ['Commercial Gym'], difficulty: ['Beginner', 'Intermediate'] },
    ],
    hamstrings: [
      { name: 'Romanian Deadlifts', equipment: ['Commercial Gym', 'Home Gym', 'Dumbbells Only'], difficulty: ['Intermediate', 'Advanced'] },
      { name: 'Leg Curls', equipment: ['Commercial Gym'], difficulty: ['Beginner', 'Intermediate', 'Advanced'] },
      { name: 'Nordic Curls', equipment: ['Commercial Gym', 'Home Gym', 'Bodyweight Only'], difficulty: ['Advanced'] },
      { name: 'Good Mornings', equipment: ['Commercial Gym', 'Home Gym'], difficulty: ['Intermediate', 'Advanced'] },
      { name: 'Glute-Ham Raises', equipment: ['Commercial Gym'], difficulty: ['Advanced'] },
    ],
    glutes: [
      { name: 'Hip Thrusts', equipment: ['Commercial Gym', 'Home Gym', 'Dumbbells Only', 'Bodyweight Only'], difficulty: ['Beginner', 'Intermediate', 'Advanced'] },
      { name: 'Glute Bridges', equipment: ['Commercial Gym', 'Home Gym', 'Dumbbells Only', 'Bodyweight Only'], difficulty: ['Beginner', 'Intermediate', 'Advanced'] },
      { name: 'Cable Pull-Throughs', equipment: ['Commercial Gym'], difficulty: ['Beginner', 'Intermediate', 'Advanced'] },
      { name: 'Bulgarian Split Squats', equipment: ['Commercial Gym', 'Home Gym', 'Dumbbells Only', 'Bodyweight Only'], difficulty: ['Intermediate', 'Advanced'] },
    ],
    calves: [
      { name: 'Standing Calf Raises', equipment: ['Commercial Gym', 'Home Gym'], difficulty: ['Beginner', 'Intermediate', 'Advanced'] },
      { name: 'Seated Calf Raises', equipment: ['Commercial Gym'], difficulty: ['Beginner', 'Intermediate', 'Advanced'] },
      { name: 'Leg Press Calf Raises', equipment: ['Commercial Gym'], difficulty: ['Beginner', 'Intermediate'] },
    ],
  },
  compounds: [
    { name: 'Deadlifts', equipment: ['Commercial Gym', 'Home Gym'], difficulty: ['Intermediate', 'Advanced'] },
    { name: 'Barbell Squats', equipment: ['Commercial Gym', 'Home Gym'], difficulty: ['Intermediate', 'Advanced'] },
    { name: 'Barbell Bench Press', equipment: ['Commercial Gym', 'Home Gym'], difficulty: ['Intermediate', 'Advanced'] },
    { name: 'Overhead Press', equipment: ['Commercial Gym', 'Home Gym', 'Dumbbells Only'], difficulty: ['Intermediate', 'Advanced'] },
    { name: 'Barbell Rows', equipment: ['Commercial Gym', 'Home Gym'], difficulty: ['Intermediate', 'Advanced'] },
    { name: 'Pull-ups', equipment: ['Commercial Gym', 'Home Gym', 'Bodyweight Only'], difficulty: ['Intermediate', 'Advanced'] },
  ],
};

// Helper function to get suitable exercises
function getExercises(category: string, muscleGroup: string, equipment: string, difficulty: string, avoid: string = ''): Exercise[] {
  let exercises: any[] = [];

  if (category === 'push' && muscleGroup === 'chest') {
    exercises = EXERCISE_DATABASE.push.chest;
  } else if (category === 'push' && muscleGroup === 'shoulders') {
    exercises = EXERCISE_DATABASE.push.shoulders;
  } else if (category === 'push' && muscleGroup === 'triceps') {
    exercises = EXERCISE_DATABASE.push.triceps;
  } else if (category === 'pull' && muscleGroup === 'back') {
    exercises = EXERCISE_DATABASE.pull.back;
  } else if (category === 'pull' && muscleGroup === 'biceps') {
    exercises = EXERCISE_DATABASE.pull.biceps;
  } else if (category === 'pull' && muscleGroup === 'rearDelts') {
    exercises = EXERCISE_DATABASE.pull.rearDelts;
  } else if (category === 'legs' && muscleGroup === 'quads') {
    exercises = EXERCISE_DATABASE.legs.quads;
  } else if (category === 'legs' && muscleGroup === 'hamstrings') {
    exercises = EXERCISE_DATABASE.legs.hamstrings;
  } else if (category === 'legs' && muscleGroup === 'glutes') {
    exercises = EXERCISE_DATABASE.legs.glutes;
  } else if (category === 'legs' && muscleGroup === 'calves') {
    exercises = EXERCISE_DATABASE.legs.calves;
  } else if (category === 'compounds') {
    exercises = EXERCISE_DATABASE.compounds;
  }

  // Filter by equipment and difficulty
  let filtered = exercises.filter(ex =>
    ex.equipment.includes(equipment) &&
    ex.difficulty.includes(difficulty) &&
    !ex.name.toLowerCase().includes(avoid.toLowerCase())
  );

  // If no exact match, try with lower equipment requirements
  if (filtered.length === 0 && equipment !== 'Bodyweight Only') {
    const equipmentOrder = ['Commercial Gym', 'Home Gym', 'Dumbbells Only', 'Bodyweight Only'];
    const currentIndex = equipmentOrder.indexOf(equipment);

    for (let i = currentIndex + 1; i < equipmentOrder.length; i++) {
      filtered = exercises.filter(ex =>
        ex.equipment.includes(equipmentOrder[i]) &&
        ex.difficulty.includes(difficulty)
      );
      if (filtered.length > 0) break;
    }
  }

  return filtered.map(ex => ({
    name: ex.name,
    sets: 0,
    reps: '0',
    weight: '',
    tempo: '',
    restSeconds: 0,
    rpe: '',
    notes: '',
  }));
}

// Generate a complete program with specific exercises
function generateDetailedProgram(
  client: any,
  splitType: string,
  durationWeeks: number,
  injuries: string = ''
): ProgramData {
  const experience = client.experience as string;
  const goals = client.goals as string;
  const equipment = client.equipment as string;
  const preferredExercises = client.preferredExercises as string;

  const isStrengthGoal = goals.toLowerCase().includes('strength');
  const isHypertrophyGoal = goals.toLowerCase().includes('hypertrophy') || goals.toLowerCase().includes('muscle');
  const isFatLossGoal = goals.toLowerCase().includes('fat') || goals.toLowerCase().includes('loss');

  const repsPhase1 = isStrengthGoal ? '5-7' : isFatLossGoal ? '12-15' : '8-12';
  const repsPhase2 = isStrengthGoal ? '3-5' : isFatLossGoal ? '12-15' : '10-12';
  const setsPhase1 = isStrengthGoal ? 5 : 4;
  const setsPhase2 = isStrengthGoal ? 4 : 3;

  const weeks: Week[] = [];
  let globalDayNumber = 0; // Track absolute day number across all weeks

  if (splitType === 'Push/Pull/Legs') {
    // PPL split - 6 days per week
    for (let week = 1; week <= durationWeeks; week++) {
      const isDeload = week === durationWeeks;
      const usePhase2 = week > 4; // Switch to phase 2 after week 4

      // Push Day 1
      const pushDay1: Week = {
        weekNumber: week,
        focus: `Week ${week} - Day 1: Push (Chest Focus)`,
        exercises: [
          {
            name: 'Barbell Bench Press',
            sets: isDeload ? 2 : (usePhase2 ? setsPhase2 : setsPhase1),
            reps: isDeload ? '8-10' : (usePhase2 ? repsPhase2 : repsPhase1),
            weight: isDeload ? '-40%' : 'RPE 7-8',
            tempo: '3-0-1-0',
            restSeconds: isDeload ? 60 : (usePhase2 ? 90 : 120),
            rpe: '7-8',
            notes: 'Control the descent, explosive press. Keep shoulders back.',
          },
          {
            name: 'Incline Dumbbell Press',
            sets: isDeload ? 2 : 3,
            reps: isDeload ? '10-12' : (usePhase2 ? '10-12' : '8-10'),
            weight: isDeload ? '-30%' : 'RPE 7-8',
            tempo: '2-0-2-0',
            restSeconds: isDeload ? 60 : (usePhase2 ? 75 : 90),
            rpe: '7-8',
            notes: '30-45 degree incline, full range of motion',
          },
          {
            name: 'Cable Flyes',
            sets: isDeload ? 2 : 3,
            reps: '12-15',
            weight: isDeload ? '-30%' : 'RPE 7',
            tempo: '2-1-2-0',
            restSeconds: isDeload ? 45 : 60,
            rpe: '7',
            notes: 'Squeeze at peak contraction, slight bend in elbows',
          },
          {
            name: 'Overhead Press',
            sets: isDeload ? 2 : 4,
            reps: isDeload ? '6-8' : (usePhase2 ? repsPhase2 : repsPhase1),
            weight: isDeload ? '-40%' : 'RPE 7-8',
            tempo: 'controlled',
            restSeconds: isDeload ? 60 : 120,
            rpe: '7-8',
            notes: 'Keep core tight, press straight up, avoid lower back arch',
          },
          {
            name: 'Lateral Raises',
            sets: isDeload ? 2 : 3,
            reps: '12-15',
            weight: isDeload ? '-30%' : 'RPE 7',
            tempo: '2-1-2-0',
            restSeconds: isDeload ? 45 : 60,
            rpe: '7',
            notes: 'Slight bend in elbows, lead with elbows not hands',
          },
          {
            name: 'Tricep Pushdowns',
            sets: isDeload ? 2 : 3,
            reps: '12-15',
            weight: isDeload ? '-30%' : 'RPE 7-8',
            tempo: '2-0-2-0',
            restSeconds: isDeload ? 45 : 60,
            rpe: '7-8',
            notes: 'Keep elbows tucked, full extension at bottom',
          },
        ],
      };

      // Pull Day 1
      const pullDay1: Week = {
        weekNumber: week,
        focus: `Week ${week} - Day 2: Pull (Back Focus)`,
        exercises: [
          {
            name: 'Barbell Rows',
            sets: isDeload ? 2 : (usePhase2 ? setsPhase2 : setsPhase1),
            reps: isDeload ? '8-10' : (usePhase2 ? repsPhase2 : repsPhase1),
            weight: isDeload ? '-40%' : 'RPE 7-8',
            tempo: '2-0-2-0',
            restSeconds: isDeload ? 60 : 120,
            rpe: '7-8',
            notes: 'Chest to bar, retract scapula, keep core tight',
          },
          {
            name: 'Lat Pulldowns',
            sets: isDeload ? 2 : 3,
            reps: isDeload ? '10-12' : (usePhase2 ? '10-12' : '8-10'),
            weight: isDeload ? '-30%' : 'RPE 7-8',
            tempo: '2-0-2-0',
            restSeconds: isDeload ? 60 : 90,
            rpe: '7-8',
            notes: 'Pull elbows down and back, squeeze lats at bottom',
          },
          {
            name: 'Dumbbell Rows',
            sets: isDeload ? 2 : 3,
            reps: '10-12',
            weight: isDeload ? '-30%' : 'RPE 7',
            tempo: '2-0-2-0',
            restSeconds: isDeload ? 45 : 90,
            rpe: '7',
            notes: 'Single arm variation, maintain neutral spine',
          },
          {
            name: 'Barbell Curls',
            sets: isDeload ? 2 : 3,
            reps: '8-12',
            weight: isDeload ? '-30%' : 'RPE 7',
            tempo: '2-0-2-0',
            restSeconds: isDeload ? 45 : 75,
            rpe: '7',
            notes: 'Minimal momentum, full range of motion',
          },
          {
            name: 'Face Pulls',
            sets: isDeload ? 2 : 3,
            reps: '12-15',
            weight: isDeload ? '-30%' : 'RPE 7',
            tempo: '2-1-2-0',
            restSeconds: isDeload ? 45 : 60,
            rpe: '7',
            notes: 'External rotation, great for rear delts and shoulders',
          },
        ],
      };

      // Legs Day 1
      const legsDay1: Week = {
        weekNumber: week,
        focus: `Week ${week} - Day 3: Legs (Quad Emphasis)`,
        exercises: [
          {
            name: 'Barbell Squats',
            sets: isDeload ? 2 : (usePhase2 ? setsPhase2 : setsPhase1),
            reps: isDeload ? '6-8' : (usePhase2 ? repsPhase2 : repsPhase1),
            weight: isDeload ? '-40%' : 'RPE 7-8',
            tempo: '3-0-2-0',
            restSeconds: isDeload ? 60 : 120,
            rpe: '7-8',
            notes: 'Keep chest up, drive through heels, full ROM',
          },
          {
            name: 'Leg Press',
            sets: isDeload ? 2 : 3,
            reps: isDeload ? '10-12' : '10-12',
            weight: isDeload ? '-30%' : 'RPE 7',
            tempo: '2-0-2-0',
            restSeconds: isDeload ? 60 : 90,
            rpe: '7',
            notes: 'Full range of motion, pause at bottom',
          },
          {
            name: 'Romanian Deadlifts',
            sets: isDeload ? 2 : 3,
            reps: '8-12',
            weight: isDeload ? '-30%' : 'RPE 7',
            tempo: '3-0-2-0',
            restSeconds: isDeload ? 45 : 90,
            rpe: '7',
            notes: 'Hip hinge movement, feel stretch in hamstrings',
          },
          {
            name: 'Leg Curls',
            sets: isDeload ? 2 : 3,
            reps: '12-15',
            weight: isDeload ? '-30%' : 'RPE 7',
            tempo: '2-1-2-0',
            restSeconds: isDeload ? 45 : 60,
            rpe: '7',
            notes: 'Controlled movement, full range of motion',
          },
          {
            name: 'Hip Thrusts',
            sets: isDeload ? 2 : 3,
            reps: '12-15',
            weight: isDeload ? '-30%' : 'RPE 7',
            tempo: '2-1-2-0',
            restSeconds: isDeload ? 45 : 60,
            rpe: '7',
            notes: 'Squeeze glutes at top, compact range ideal',
          },
          {
            name: 'Standing Calf Raises',
            sets: isDeload ? 2 : 3,
            reps: '12-15',
            weight: isDeload ? '-30%' : 'RPE 6-7',
            tempo: '1-1-1-0',
            restSeconds: isDeload ? 30 : 45,
            rpe: '6-7',
            notes: 'Full range of motion, pause at top',
          },
        ],
      };

      // Push Day 2
      const pushDay2: Week = {
        weekNumber: week,
        focus: `Week ${week} - Day 4: Push (Shoulder Focus)`,
        exercises: [
          {
            name: 'Dumbbell Shoulder Press',
            sets: isDeload ? 2 : (usePhase2 ? setsPhase2 : setsPhase1),
            reps: isDeload ? '8-10' : (usePhase2 ? repsPhase2 : repsPhase1),
            weight: isDeload ? '-30%' : 'RPE 7-8',
            tempo: '2-0-2-0',
            restSeconds: isDeload ? 60 : 120,
            rpe: '7-8',
            notes: 'Full range of motion, strict form',
          },
          {
            name: 'Machine Chest Press',
            sets: isDeload ? 2 : 3,
            reps: '10-12',
            weight: isDeload ? '-30%' : 'RPE 7',
            tempo: '2-0-2-0',
            restSeconds: isDeload ? 45 : 90,
            rpe: '7',
            notes: 'Controlled movement, full range',
          },
          {
            name: 'Lateral Raises',
            sets: isDeload ? 2 : 3,
            reps: '12-15',
            weight: isDeload ? '-30%' : 'RPE 7',
            tempo: '2-1-2-0',
            restSeconds: isDeload ? 45 : 60,
            rpe: '7',
            notes: 'Lead with elbows, slight bend',
          },
          {
            name: 'Close-Grip Bench Press',
            sets: isDeload ? 2 : 3,
            reps: '8-12',
            weight: isDeload ? '-30%' : 'RPE 7',
            tempo: '2-0-2-0',
            restSeconds: isDeload ? 45 : 90,
            rpe: '7',
            notes: 'Tricep focus, hands closer than shoulder width',
          },
          {
            name: 'Front Raises',
            sets: isDeload ? 2 : 3,
            reps: '12-15',
            weight: isDeload ? '-30%' : 'RPE 7',
            tempo: '2-1-2-0',
            restSeconds: isDeload ? 45 : 60,
            rpe: '7',
            notes: 'Anterior shoulder emphasis',
          },
          {
            name: 'Dumbbell Tricep Extensions',
            sets: isDeload ? 2 : 3,
            reps: '12-15',
            weight: isDeload ? '-30%' : 'RPE 7',
            tempo: '2-0-2-0',
            restSeconds: isDeload ? 45 : 60,
            rpe: '7',
            notes: 'Full range of motion overhead',
          },
        ],
      };

      // Pull Day 2
      const pullDay2: Week = {
        weekNumber: week,
        focus: `Week ${week} - Day 5: Pull (Lat Focus)`,
        exercises: [
          {
            name: 'Pull-ups',
            sets: isDeload ? 2 : 3,
            reps: isDeload ? '6-8' : (usePhase2 ? '8-10' : '6-8'),
            weight: isDeload ? '-30%' : 'RPE 7-8',
            tempo: '2-0-2-0',
            restSeconds: isDeload ? 60 : 120,
            rpe: '7-8',
            notes: 'Full range of motion, lat focus',
          },
          {
            name: 'Seated Cable Rows',
            sets: isDeload ? 2 : 3,
            reps: '10-12',
            weight: isDeload ? '-30%' : 'RPE 7',
            tempo: '2-0-2-0',
            restSeconds: isDeload ? 45 : 90,
            rpe: '7',
            notes: 'Chest to machine, retract scapula',
          },
          {
            name: 'Machine Lat Pulldowns',
            sets: isDeload ? 2 : 3,
            reps: '10-12',
            weight: isDeload ? '-30%' : 'RPE 7',
            tempo: '2-0-2-0',
            restSeconds: isDeload ? 45 : 75,
            rpe: '7',
            notes: 'Wide grip for lat emphasis',
          },
          {
            name: 'Dumbbell Hammer Curls',
            sets: isDeload ? 2 : 3,
            reps: '10-12',
            weight: isDeload ? '-30%' : 'RPE 7',
            tempo: '2-0-2-0',
            restSeconds: isDeload ? 45 : 75,
            rpe: '7',
            notes: 'Neutral grip, full range',
          },
          {
            name: 'Reverse Flyes',
            sets: isDeload ? 2 : 3,
            reps: '12-15',
            weight: isDeload ? '-30%' : 'RPE 7',
            tempo: '2-1-2-0',
            restSeconds: isDeload ? 45 : 60,
            rpe: '7',
            notes: 'Rear delt emphasis, squeeze at top',
          },
          {
            name: 'Cable Curls',
            sets: isDeload ? 2 : 3,
            reps: '12-15',
            weight: isDeload ? '-30%' : 'RPE 7',
            tempo: '2-0-2-0',
            restSeconds: isDeload ? 30 : 45,
            rpe: '7',
            notes: 'Constant tension, full range',
          },
        ],
      };

      // Legs Day 2
      const legsDay2: Week = {
        weekNumber: week,
        focus: `Week ${week} - Day 6: Legs (Hamstring Emphasis)`,
        exercises: [
          {
            name: 'Deadlifts',
            sets: isDeload ? 2 : (usePhase2 ? setsPhase2 : setsPhase1),
            reps: isDeload ? '5-6' : (usePhase2 ? '5-8' : '5-7'),
            weight: isDeload ? '-40%' : 'RPE 7-8',
            tempo: '2-0-2-0',
            restSeconds: isDeload ? 60 : 120,
            rpe: '7-8',
            notes: 'Full body compound, drive through heels',
          },
          {
            name: 'Hack Squats',
            sets: isDeload ? 2 : 3,
            reps: '10-12',
            weight: isDeload ? '-30%' : 'RPE 7',
            tempo: '2-0-2-0',
            restSeconds: isDeload ? 45 : 90,
            rpe: '7',
            notes: 'Machine guidance, full ROM',
          },
          {
            name: 'Leg Curls Machine',
            sets: isDeload ? 2 : 3,
            reps: isDeload ? '10-12' : (usePhase2 ? '10-12' : '8-10'),
            weight: isDeload ? '-30%' : 'RPE 7-8',
            tempo: '2-1-2-0',
            restSeconds: isDeload ? 45 : 90,
            rpe: '7-8',
            notes: 'Hamstring isolation, pause at top',
          },
          {
            name: 'Bulgarian Split Squats',
            sets: isDeload ? 2 : 3,
            reps: '10-12',
            weight: isDeload ? '-30%' : 'RPE 7',
            tempo: '2-0-2-0',
            restSeconds: isDeload ? 45 : 60,
            rpe: '7',
            notes: 'Single leg variation, quad and glute focus',
          },
          {
            name: 'Glute Bridges',
            sets: isDeload ? 2 : 3,
            reps: '12-15',
            weight: isDeload ? '-30%' : 'RPE 7',
            tempo: '2-1-2-0',
            restSeconds: isDeload ? 45 : 60,
            rpe: '7',
            notes: 'Glute activation, squeeze at top',
          },
          {
            name: 'Seated Calf Raises',
            sets: isDeload ? 2 : 3,
            reps: '15-20',
            weight: isDeload ? '-30%' : 'RPE 6-7',
            tempo: '1-1-1-0',
            restSeconds: isDeload ? 30 : 45,
            rpe: '6-7',
            notes: 'High reps for calf development',
          },
        ],
      };

      weeks.push(pushDay1);
      weeks.push(pullDay1);
      weeks.push(legsDay1);
      weeks.push(pushDay2);
      weeks.push(pullDay2);
      weeks.push(legsDay2);
    }
  } else if (splitType === 'Upper/Lower') {
    // Upper/Lower split - 4 days per week
    for (let week = 1; week <= durationWeeks; week++) {
      const isDeload = week === durationWeeks;
      const usePhase2 = week > 4;

      // Upper Day A (Chest Focus)
      const upperA: Week = {
        weekNumber: week,
        focus: `Week ${week} - Day 1: Upper A (Chest Focus)`,
        exercises: [
          {
            name: 'Barbell Bench Press',
            sets: isDeload ? 2 : (usePhase2 ? setsPhase2 : setsPhase1),
            reps: isDeload ? '8-10' : (usePhase2 ? repsPhase2 : repsPhase1),
            weight: isDeload ? '-40%' : 'RPE 7-8',
            tempo: '3-0-1-0',
            restSeconds: isDeload ? 60 : 120,
            rpe: '7-8',
            notes: 'Control descent, explosive press',
          },
          {
            name: 'Barbell Rows',
            sets: isDeload ? 2 : 3,
            reps: isDeload ? '8-10' : '8-10',
            weight: isDeload ? '-30%' : 'RPE 7',
            tempo: '2-0-2-0',
            restSeconds: isDeload ? 60 : 90,
            rpe: '7',
            notes: 'Chest to bar, strong contraction',
          },
          {
            name: 'Incline Dumbbell Press',
            sets: isDeload ? 2 : 3,
            reps: '10-12',
            weight: isDeload ? '-30%' : 'RPE 7',
            tempo: '2-0-2-0',
            restSeconds: isDeload ? 45 : 75,
            rpe: '7',
            notes: 'Upper chest emphasis',
          },
          {
            name: 'Lat Pulldowns',
            sets: isDeload ? 2 : 3,
            reps: '10-12',
            weight: isDeload ? '-30%' : 'RPE 7',
            tempo: '2-0-2-0',
            restSeconds: isDeload ? 45 : 75,
            rpe: '7',
            notes: 'Pull elbows to hips',
          },
          {
            name: 'Overhead Press',
            sets: isDeload ? 2 : 3,
            reps: '8-10',
            weight: isDeload ? '-30%' : 'RPE 7',
            tempo: 'controlled',
            restSeconds: isDeload ? 45 : 90,
            rpe: '7',
            notes: 'Strict form, no leg drive',
          },
          {
            name: 'Barbell Curls',
            sets: isDeload ? 1 : 3,
            reps: '10-12',
            weight: isDeload ? '-30%' : 'RPE 7',
            tempo: '2-0-2-0',
            restSeconds: isDeload ? 30 : 60,
            rpe: '7',
            notes: 'Controlled, full range',
          },
          {
            name: 'Tricep Pushdowns',
            sets: isDeload ? 1 : 3,
            reps: '12-15',
            weight: isDeload ? '-30%' : 'RPE 7',
            tempo: '2-0-2-0',
            restSeconds: isDeload ? 30 : 45,
            rpe: '7',
            notes: 'Elbows tucked',
          },
        ],
      };

      // Lower Day A (Quad Emphasis)
      const lowerA: Week = {
        weekNumber: week,
        focus: `Week ${week} - Day 2: Lower A (Quad Emphasis)`,
        exercises: [
          {
            name: 'Barbell Squats',
            sets: isDeload ? 2 : (usePhase2 ? setsPhase2 : setsPhase1),
            reps: isDeload ? '8-10' : (usePhase2 ? repsPhase2 : repsPhase1),
            weight: isDeload ? '-40%' : 'RPE 7-8',
            tempo: '3-0-2-0',
            restSeconds: isDeload ? 60 : 120,
            rpe: '7-8',
            notes: 'Full depth, chest up',
          },
          {
            name: 'Romanian Deadlifts',
            sets: isDeload ? 2 : 3,
            reps: '8-12',
            weight: isDeload ? '-30%' : 'RPE 7',
            tempo: '3-0-2-0',
            restSeconds: isDeload ? 45 : 90,
            rpe: '7',
            notes: 'Hip hinge, hamstring focus',
          },
          {
            name: 'Leg Press',
            sets: isDeload ? 2 : 3,
            reps: '12-15',
            weight: isDeload ? '-30%' : 'RPE 7',
            tempo: '2-0-2-0',
            restSeconds: isDeload ? 45 : 75,
            rpe: '7',
            notes: 'Full ROM, quad focus',
          },
          {
            name: 'Leg Curls',
            sets: isDeload ? 1 : 3,
            reps: '12-15',
            weight: isDeload ? '-30%' : 'RPE 7',
            tempo: '2-1-2-0',
            restSeconds: isDeload ? 30 : 60,
            rpe: '7',
            notes: 'Hamstring isolation',
          },
          {
            name: 'Hip Thrusts',
            sets: isDeload ? 1 : 3,
            reps: '12-15',
            weight: isDeload ? '-30%' : 'RPE 7',
            tempo: '2-1-2-0',
            restSeconds: isDeload ? 30 : 60,
            rpe: '7',
            notes: 'Glute activation and strengthening',
          },
          {
            name: 'Standing Calf Raises',
            sets: isDeload ? 1 : 2,
            reps: '15-20',
            weight: isDeload ? '-30%' : 'RPE 6-7',
            tempo: '1-1-1-0',
            restSeconds: isDeload ? 30 : 45,
            rpe: '6-7',
            notes: 'High reps for calves',
          },
        ],
      };

      // Upper Day B (Back Focus)
      const upperB: Week = {
        weekNumber: week,
        focus: `Week ${week} - Day 3: Upper B (Back Focus)`,
        exercises: [
          {
            name: 'Barbell Rows',
            sets: isDeload ? 2 : (usePhase2 ? setsPhase2 : setsPhase1),
            reps: isDeload ? '8-10' : (usePhase2 ? repsPhase2 : repsPhase1),
            weight: isDeload ? '-40%' : 'RPE 7-8',
            tempo: '2-0-2-0',
            restSeconds: isDeload ? 60 : 120,
            rpe: '7-8',
            notes: 'Chest to bar, strong back contraction',
          },
          {
            name: 'Incline Barbell Press',
            sets: isDeload ? 2 : 3,
            reps: isDeload ? '8-10' : '8-10',
            weight: isDeload ? '-30%' : 'RPE 7',
            tempo: '2-0-2-0',
            restSeconds: isDeload ? 60 : 90,
            rpe: '7',
            notes: 'Upper body pressing',
          },
          {
            name: 'Lat Pulldowns',
            sets: isDeload ? 2 : 3,
            reps: '10-12',
            weight: isDeload ? '-30%' : 'RPE 7',
            tempo: '2-0-2-0',
            restSeconds: isDeload ? 45 : 75,
            rpe: '7',
            notes: 'Lat width development',
          },
          {
            name: 'Machine Chest Press',
            sets: isDeload ? 2 : 3,
            reps: '10-12',
            weight: isDeload ? '-30%' : 'RPE 7',
            tempo: '2-0-2-0',
            restSeconds: isDeload ? 45 : 75,
            rpe: '7',
            notes: 'Chest stability work',
          },
          {
            name: 'Dumbbell Hammer Curls',
            sets: isDeload ? 1 : 3,
            reps: '10-12',
            weight: isDeload ? '-30%' : 'RPE 7',
            tempo: '2-0-2-0',
            restSeconds: isDeload ? 30 : 60,
            rpe: '7',
            notes: 'Neutral grip bicep work',
          },
          {
            name: 'Overhead Tricep Extensions',
            sets: isDeload ? 1 : 3,
            reps: '12-15',
            weight: isDeload ? '-30%' : 'RPE 7',
            tempo: '2-0-2-0',
            restSeconds: isDeload ? 30 : 45,
            rpe: '7',
            notes: 'Tricep isolation',
          },
        ],
      };

      // Lower Day B (Hamstring/Glute Emphasis)
      const lowerB: Week = {
        weekNumber: week,
        focus: `Week ${week} - Day 4: Lower B (Hamstring/Glute Focus)`,
        exercises: [
          {
            name: 'Deadlifts',
            sets: isDeload ? 2 : (usePhase2 ? setsPhase2 : setsPhase1),
            reps: isDeload ? '5-6' : (usePhase2 ? '5-8' : '5-7'),
            weight: isDeload ? '-40%' : 'RPE 7-8',
            tempo: '2-0-2-0',
            restSeconds: isDeload ? 60 : 120,
            rpe: '7-8',
            notes: 'Primary hinge movement',
          },
          {
            name: 'Leg Curls',
            sets: isDeload ? 2 : 3,
            reps: isDeload ? '10-12' : (usePhase2 ? '10-12' : '8-10'),
            weight: isDeload ? '-30%' : 'RPE 7-8',
            tempo: '2-1-2-0',
            restSeconds: isDeload ? 45 : 90,
            rpe: '7-8',
            notes: 'Hamstring isolation focus',
          },
          {
            name: 'Leg Press',
            sets: isDeload ? 2 : 3,
            reps: '12-15',
            weight: isDeload ? '-30%' : 'RPE 7',
            tempo: '2-0-2-0',
            restSeconds: isDeload ? 45 : 75,
            rpe: '7',
            notes: 'Quad accessory work',
          },
          {
            name: 'Hip Thrusts',
            sets: isDeload ? 2 : 3,
            reps: '12-15',
            weight: isDeload ? '-30%' : 'RPE 7',
            tempo: '2-1-2-0',
            restSeconds: isDeload ? 45 : 60,
            rpe: '7',
            notes: 'Glute emphasis, squeeze at top',
          },
          {
            name: 'Good Mornings',
            sets: isDeload ? 1 : 3,
            reps: '10-12',
            weight: isDeload ? '-30%' : 'RPE 7',
            tempo: '3-0-2-0',
            restSeconds: isDeload ? 30 : 60,
            rpe: '7',
            notes: 'Posterior chain accessory',
          },
          {
            name: 'Seated Calf Raises',
            sets: isDeload ? 1 : 2,
            reps: '15-20',
            weight: isDeload ? '-30%' : 'RPE 6-7',
            tempo: '1-1-1-0',
            restSeconds: isDeload ? 30 : 45,
            rpe: '6-7',
            notes: 'Calf development',
          },
        ],
      };

      weeks.push(upperA);
      weeks.push(lowerA);
      weeks.push(upperB);
      weeks.push(lowerB);
    }
  } else {
    // Full Body split - 3 days per week
    for (let week = 1; week <= durationWeeks; week++) {
      const isDeload = week === durationWeeks;
      const usePhase2 = week > 4;

      // Full Body A
      const fullBodyA: Week = {
        weekNumber: week,
        focus: `Week ${week} - Day 1: Full Body A`,
        exercises: [
          {
            name: 'Barbell Squats',
            sets: isDeload ? 2 : (usePhase2 ? setsPhase2 : setsPhase1),
            reps: isDeload ? '8-10' : (usePhase2 ? repsPhase2 : repsPhase1),
            weight: isDeload ? '-40%' : 'RPE 7-8',
            tempo: '3-0-2-0',
            restSeconds: isDeload ? 60 : 120,
            rpe: '7-8',
            notes: 'Primary compound, full depth',
          },
          {
            name: 'Barbell Rows',
            sets: isDeload ? 2 : 3,
            reps: '8-10',
            weight: isDeload ? '-30%' : 'RPE 7',
            tempo: '2-0-2-0',
            restSeconds: isDeload ? 60 : 90,
            rpe: '7',
            notes: 'Chest to bar, back focus',
          },
          {
            name: 'Barbell Bench Press',
            sets: isDeload ? 2 : 3,
            reps: '8-10',
            weight: isDeload ? '-30%' : 'RPE 7',
            tempo: '3-0-1-0',
            restSeconds: isDeload ? 60 : 90,
            rpe: '7',
            notes: 'Upper body push',
          },
          {
            name: 'Lat Pulldowns',
            sets: isDeload ? 1 : 3,
            reps: '10-12',
            weight: isDeload ? '-30%' : 'RPE 7',
            tempo: '2-0-2-0',
            restSeconds: isDeload ? 45 : 75,
            rpe: '7',
            notes: 'Back width, upper body pull',
          },
          {
            name: 'Leg Press',
            sets: isDeload ? 1 : 3,
            reps: '12-15',
            weight: isDeload ? '-30%' : 'RPE 7',
            tempo: '2-0-2-0',
            restSeconds: isDeload ? 45 : 60,
            rpe: '7',
            notes: 'Quad accessory',
          },
          {
            name: 'Dumbbell Rows',
            sets: isDeload ? 1 : 2,
            reps: '10-12',
            weight: isDeload ? '-30%' : 'RPE 7',
            tempo: '2-0-2-0',
            restSeconds: isDeload ? 45 : 60,
            rpe: '7',
            notes: 'Accessory row, single arm',
          },
        ],
      };

      // Full Body B
      const fullBodyB: Week = {
        weekNumber: week,
        focus: `Week ${week} - Day 2: Full Body B`,
        exercises: [
          {
            name: 'Deadlifts',
            sets: isDeload ? 2 : (usePhase2 ? setsPhase2 : setsPhase1),
            reps: isDeload ? '5-6' : (usePhase2 ? '5-8' : '6-8'),
            weight: isDeload ? '-40%' : 'RPE 7-8',
            tempo: '2-0-2-0',
            restSeconds: isDeload ? 60 : 120,
            rpe: '7-8',
            notes: 'Primary hinge movement',
          },
          {
            name: 'Overhead Press',
            sets: isDeload ? 2 : 3,
            reps: '6-8',
            weight: isDeload ? '-30%' : 'RPE 7',
            tempo: 'controlled',
            restSeconds: isDeload ? 60 : 90,
            rpe: '7',
            notes: 'Overhead compound',
          },
          {
            name: 'Pull-ups',
            sets: isDeload ? 2 : 3,
            reps: '8-12',
            weight: isDeload ? '-30%' : 'RPE 7',
            tempo: '2-0-2-0',
            restSeconds: isDeload ? 60 : 90,
            rpe: '7',
            notes: 'Pull movement variation',
          },
          {
            name: 'Incline Dumbbell Press',
            sets: isDeload ? 1 : 3,
            reps: '10-12',
            weight: isDeload ? '-30%' : 'RPE 7',
            tempo: '2-0-2-0',
            restSeconds: isDeload ? 45 : 75,
            rpe: '7',
            notes: 'Accessory press',
          },
          {
            name: 'Bulgarian Split Squats',
            sets: isDeload ? 1 : 2,
            reps: '10-12',
            weight: isDeload ? '-30%' : 'RPE 7',
            tempo: '2-0-2-0',
            restSeconds: isDeload ? 45 : 60,
            rpe: '7',
            notes: 'Single leg quad work',
          },
          {
            name: 'Barbell Curls',
            sets: isDeload ? 1 : 2,
            reps: '10-12',
            weight: isDeload ? '-30%' : 'RPE 7',
            tempo: '2-0-2-0',
            restSeconds: isDeload ? 30 : 45,
            rpe: '7',
            notes: 'Arm accessory',
          },
        ],
      };

      // Full Body C
      const fullBodyC: Week = {
        weekNumber: week,
        focus: `Week ${week} - Day 3: Full Body C`,
        exercises: [
          {
            name: 'Front Squats',
            sets: isDeload ? 2 : (usePhase2 ? setsPhase2 : setsPhase1),
            reps: isDeload ? '8-10' : (usePhase2 ? repsPhase2 : repsPhase1),
            weight: isDeload ? '-40%' : 'RPE 7-8',
            tempo: '3-0-2-0',
            restSeconds: isDeload ? 60 : 120,
            rpe: '7-8',
            notes: 'Quad emphasis variation',
          },
          {
            name: 'Romanian Deadlifts',
            sets: isDeload ? 2 : 3,
            reps: '8-12',
            weight: isDeload ? '-30%' : 'RPE 7',
            tempo: '3-0-2-0',
            restSeconds: isDeload ? 60 : 90,
            rpe: '7',
            notes: 'Hip hinge movement',
          },
          {
            name: 'Machine Chest Press',
            sets: isDeload ? 2 : 3,
            reps: '10-12',
            weight: isDeload ? '-30%' : 'RPE 7',
            tempo: '2-0-2-0',
            restSeconds: isDeload ? 60 : 90,
            rpe: '7',
            notes: 'Chest variation',
          },
          {
            name: 'Seated Cable Rows',
            sets: isDeload ? 1 : 3,
            reps: '10-12',
            weight: isDeload ? '-30%' : 'RPE 7',
            tempo: '2-0-2-0',
            restSeconds: isDeload ? 45 : 75,
            rpe: '7',
            notes: 'Back width and thickness',
          },
          {
            name: 'Dumbbell Lateral Raises',
            sets: isDeload ? 1 : 2,
            reps: '12-15',
            weight: isDeload ? '-30%' : 'RPE 7',
            tempo: '2-1-2-0',
            restSeconds: isDeload ? 45 : 60,
            rpe: '7',
            notes: 'Shoulder accessory',
          },
          {
            name: 'Leg Curls',
            sets: isDeload ? 1 : 2,
            reps: '12-15',
            weight: isDeload ? '-30%' : 'RPE 7',
            tempo: '2-1-2-0',
            restSeconds: isDeload ? 30 : 45,
            rpe: '7',
            notes: 'Hamstring isolation',
          },
        ],
      };

      weeks.push(fullBodyA);
      weeks.push(fullBodyB);
      weeks.push(fullBodyC);
    }
  }

  return {
    weeks,
    deloadWeek: durationWeeks,
    progressionStrategy: 'Progressive overload with RPE auto-regulation. Add weight when reps become too easy, or add reps within the range.',
    notes: `Periodized ${splitType} program with ${durationWeeks} weeks. Weeks 1-4 focus on hypertrophy/strength base. Week ${durationWeeks} is deload week.`,
  };
}

export function register(app: App, fastify: FastifyInstance) {
  // POST /api/programs/generate - Generate AI program
  fastify.post(
    '/api/programs/generate',
    {
      schema: {
        description:
          'Generate a fully periodized workout program using AI based on client profile',
        tags: ['programs'],
        body: {
          type: 'object',
          required: ['client_id'],
          properties: {
            client_id: { type: 'string', format: 'uuid' },
          },
        },
        response: {
          201: {
            description: 'Program generated successfully',
            type: 'object',
            properties: {
              program_id: { type: 'string', format: 'uuid' },
              program_name: { type: 'string' },
              duration_weeks: { type: 'number' },
              split_type: { type: 'string' },
              program_data: { type: 'object' },
            },
          },
          400: { type: 'object', properties: { error: { type: 'string' } } },
          404: { type: 'object', properties: { error: { type: 'string' } } },
        },
      },
    },
    async (
      request: FastifyRequest<{ Body: GenerateProgramBody }>,
      reply: FastifyReply
    ) => {
      const clientId = request.body.client_id || request.body.clientId;
      app.logger.info(
        { clientId },
        'Generating workout program'
      );

      try {
        // Fetch client details
        const [client] = await app.db
          .select()
          .from(schema.clients)
          .where(eq(schema.clients.id, clientId!));

        if (!client) {
          app.logger.warn(
            { clientId },
            'Client not found for program generation'
          );
          return reply.status(404).send({ error: 'Client not found' });
        }

        app.logger.info(
          { clientId: client.id, name: client.name },
          'Client fetched for program generation'
        );

        // Build client profile for AI
        const clientProfile = {
          name: client.name,
          age: client.age,
          experience: client.experience,
          goals: client.goals,
          trainingFrequency: client.trainingFrequency,
          equipment: client.equipment,
          injuries: client.injuries,
          preferredExercises: client.preferredExercises,
          sessionDuration: client.sessionDuration,
          strength: {
            squat1rm: client.squat1rm,
            bench1rm: client.bench1rm,
            deadlift1rm: client.deadlift1rm,
          },
          height: client.height,
          weight: client.weight,
          bodyFatPercentage: client.bodyFatPercentage,
        };

        // Determine split type based on training frequency
        let splitType = 'Full Body';
        let durationWeeks = 8;

        if (client.trainingFrequency >= 5) {
          splitType = 'Push/Pull/Legs';
          durationWeeks = 12;
        } else if (client.trainingFrequency === 4) {
          splitType = 'Upper/Lower';
          durationWeeks = 8;
        } else if (client.trainingFrequency === 3) {
          splitType = 'Full Body';
          durationWeeks = 8;
        }

        // Generate detailed program with specific exercises
        let programData: ProgramData;
        try {
          programData = generateDetailedProgram(
            client,
            splitType,
            durationWeeks,
            client.injuries || ''
          );
        } catch (error) {
          app.logger.warn(
            { err: error },
            'Failed to generate detailed program, using fallback'
          );
          // Fallback minimal structure
          programData = {
            weeks: [
              {
                weekNumber: 1,
                focus: 'Week 1 Compound Focus',
                exercises: [
                  {
                    name: 'Barbell Squats',
                    sets: 4,
                    reps: '8-12',
                    weight: 'RPE 7-8',
                    tempo: '3-0-2-0',
                    restSeconds: 120,
                    rpe: '7-8',
                    notes: 'Full depth, chest up',
                  },
                  {
                    name: 'Barbell Bench Press',
                    sets: 4,
                    reps: '8-12',
                    weight: 'RPE 7-8',
                    tempo: '3-0-1-0',
                    restSeconds: 120,
                    rpe: '7-8',
                    notes: 'Control descent, explosive press',
                  },
                  {
                    name: 'Barbell Rows',
                    sets: 4,
                    reps: '8-12',
                    weight: 'RPE 7-8',
                    tempo: '2-0-2-0',
                    restSeconds: 120,
                    rpe: '7-8',
                    notes: 'Chest to bar, retract scapula',
                  },
                ],
              },
            ],
            progressionStrategy: 'Linear progression with RPE auto-regulation',
            notes: 'Fallback program - use detailed generation for full training plans',
          };
        }

        app.logger.info(
          { clientId: client.id, weeks: programData.weeks.length },
          'Program structure generated by AI'
        );

        // Determine program name
        const goalName = (clientProfile.goals || 'General').split(',')[0].trim();
        const programName = `${client.name}'s ${durationWeeks}-Week ${splitType} - ${goalName}`;

        // Create program record
        const [program] = await app.db
          .insert(schema.workoutPrograms)
          .values({
            clientId: client.id,
            programName,
            durationWeeks,
            splitType,
            programData: programData as unknown as Record<string, any>,
          })
          .returning();

        app.logger.info(
          { programId: program.id, clientId: client.id },
          'Program created successfully'
        );

        // Create workout sessions from program data
        for (const week of programData.weeks) {
          // Extract day number from focus string (e.g., "Week 1 - Day 3: Legs" -> 3)
          const dayMatch = week.focus.match(/Day (\d+)/);
          const dayNumber = dayMatch ? parseInt(dayMatch[1]) : 1;
          const sessionName = week.focus;

          await app.db
            .insert(schema.workoutSessions)
            .values({
              programId: program.id,
              clientId: client.id,
              weekNumber: week.weekNumber,
              dayNumber: dayNumber,
              sessionName,
              exercises: week.exercises as unknown as Record<string, any>,
              completed: false,
            });
        }

        app.logger.info(
          { programId: program.id, sessionCount: programData.weeks.length },
          'Workout sessions created'
        );

        reply.status(201);
        return {
          program_id: program.id,
          program_name: programName,
          duration_weeks: durationWeeks,
          split_type: splitType,
          program_data: programData,
        };
      } catch (error) {
        app.logger.error(
          { err: error, clientId },
          'Failed to generate program'
        );
        throw error;
      }
    }
  );

  // GET /api/programs/client/:client_id - Get all programs for a client
  fastify.get(
    '/api/programs/client/:client_id',
    {
      schema: {
        description: 'Get all programs for a specific client',
        tags: ['programs'],
        params: {
          type: 'object',
          required: ['client_id'],
          properties: {
            client_id: { type: 'string', format: 'uuid' },
          },
        },
        response: {
          200: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                program_name: { type: 'string' },
                duration_weeks: { type: 'number' },
                split_type: { type: 'string' },
                created_at: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{ Params: GetClientProgramsParams }>,
      reply
    ) => {
      app.logger.info(
        { clientId: request.params.client_id },
        'Fetching client programs'
      );

      try {
        const programs = await app.db
          .select({
            id: schema.workoutPrograms.id,
            program_name: schema.workoutPrograms.programName,
            duration_weeks: schema.workoutPrograms.durationWeeks,
            split_type: schema.workoutPrograms.splitType,
            created_at: schema.workoutPrograms.createdAt,
          })
          .from(schema.workoutPrograms)
          .where(
            eq(schema.workoutPrograms.clientId, request.params.client_id)
          );

        app.logger.info(
          { clientId: request.params.client_id, count: programs.length },
          'Programs fetched'
        );
        return programs;
      } catch (error) {
        app.logger.error(
          { err: error, clientId: request.params.client_id },
          'Failed to fetch programs'
        );
        throw error;
      }
    }
  );

  // GET /api/programs/:id - Get full program with sessions
  fastify.get(
    '/api/programs/:id',
    {
      schema: {
        description: 'Get full program with all workout sessions',
        tags: ['programs'],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              client_id: { type: 'string', format: 'uuid' },
              program_name: { type: 'string' },
              duration_weeks: { type: 'number' },
              split_type: { type: 'string' },
              program_data: { type: 'object' },
              sessions: { type: 'array' },
              created_at: { type: 'string', format: 'date-time' },
            },
          },
          404: { type: 'object', properties: { error: { type: 'string' } } },
        },
      },
    },
    async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
      app.logger.info({ programId: request.params.id }, 'Fetching program');

      try {
        const [program] = await app.db
          .select()
          .from(schema.workoutPrograms)
          .where(eq(schema.workoutPrograms.id, request.params.id));

        if (!program) {
          app.logger.warn(
            { programId: request.params.id },
            'Program not found'
          );
          return reply.status(404).send({ error: 'Program not found' });
        }

        // Fetch sessions for this program
        const sessions = await app.db
          .select()
          .from(schema.workoutSessions)
          .where(
            eq(schema.workoutSessions.programId, request.params.id)
          );

        app.logger.info(
          { programId: program.id, sessionCount: sessions.length },
          'Program and sessions fetched'
        );

        return {
          id: program.id,
          client_id: program.clientId,
          program_name: program.programName,
          duration_weeks: program.durationWeeks,
          split_type: program.splitType,
          program_data: program.programData,
          sessions: sessions.map(s => ({
            id: s.id,
            program_id: s.programId,
            client_id: s.clientId,
            week_number: s.weekNumber,
            day_number: s.dayNumber,
            session_name: s.sessionName,
            exercises: s.exercises,
            completed: s.completed,
            completed_at: s.completedAt,
            notes: s.notes,
            created_at: s.createdAt,
          })),
          created_at: program.createdAt,
        };
      } catch (error) {
        app.logger.error(
          { err: error, programId: request.params.id },
          'Failed to fetch program'
        );
        throw error;
      }
    }
  );

  // DELETE /api/programs/:id - Delete program
  fastify.delete(
    '/api/programs/:id',
    {
      schema: {
        description: 'Delete program and all associated sessions',
        tags: ['programs'],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: { success: { type: 'boolean' } },
          },
          404: { type: 'object', properties: { error: { type: 'string' } } },
        },
      },
    },
    async (request: FastifyRequest<{ Params: DeleteProgramParams }>, reply) => {
      app.logger.info({ programId: request.params.id }, 'Deleting program');

      try {
        const [deleted] = await app.db
          .delete(schema.workoutPrograms)
          .where(eq(schema.workoutPrograms.id, request.params.id))
          .returning({ id: schema.workoutPrograms.id });

        if (!deleted) {
          app.logger.warn(
            { programId: request.params.id },
            'Program not found for deletion'
          );
          return reply.status(404).send({ error: 'Program not found' });
        }

        app.logger.info(
          { programId: deleted.id },
          'Program deleted successfully'
        );
        return { success: true };
      } catch (error) {
        app.logger.error(
          { err: error, programId: request.params.id },
          'Failed to delete program'
        );
        throw error;
      }
    }
  );
}
