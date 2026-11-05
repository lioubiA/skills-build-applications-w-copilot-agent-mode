import { Activity, Team, User, Workout } from '../models/index.js';
import mongoose from 'mongoose';

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  const data = input as Record<string, unknown>;
  
  // Validate required fields
  if (!data.userId || !data.teamId || !data.type || data.minutes === undefined) {
    const error = new Error('Missing required fields: userId, teamId, type, minutes');
    Object.assign(error, { status: 400 });
    throw error;
  }
  
  // Validate ObjectId format
  if (!mongoose.Types.ObjectId.isValid(data.userId as string)) {
    const error = new Error('Invalid userId format');
    Object.assign(error, { status: 400 });
    throw error;
  }
  
  if (!mongoose.Types.ObjectId.isValid(data.teamId as string)) {
    const error = new Error('Invalid teamId format');
    Object.assign(error, { status: 400 });
    throw error;
  }
  
  // Verify references exist
  const userId = new mongoose.Types.ObjectId(data.userId as string);
  const teamId = new mongoose.Types.ObjectId(data.teamId as string);
  
  const user = await User.findById(userId);
  const team = await Team.findById(teamId);
  
  if (!user || !team) {
    const error = new Error('User or team not found');
    Object.assign(error, { status: 404 });
    throw error;
  }
  
  // Create activity
  const activity = await Activity.create({
    user: userId,
    team: teamId,
    type: data.type,
    minutes: data.minutes,
    points: Math.ceil((data.minutes as number) * 1), // 1 point per minute
    occurredAt: new Date(),
  });
  
  return activity.toObject();
}

export async function listTeams() {
  const teams = await Team.find().populate('members').lean();
  return teams.map(team => ({
    ...team,
    members: (team.members as any[]).map((m: any) => m._id || m),
  }));
}

export async function createTeam(input: unknown) {
  const data = input as Record<string, unknown>;
  
  // Validate required fields
  if (!data.name || !data.mascot) {
    const error = new Error('Missing required fields: name, mascot');
    Object.assign(error, { status: 400 });
    throw error;
  }
  
  // Validate members if provided
  const memberIds: mongoose.Types.ObjectId[] = [];
  if (Array.isArray(data.members)) {
    for (const memberId of data.members) {
      if (!mongoose.Types.ObjectId.isValid(memberId as string)) {
        const error = new Error('Invalid member ID format');
        Object.assign(error, { status: 400 });
        throw error;
      }
      memberIds.push(new mongoose.Types.ObjectId(memberId as string));
    }
  }
  
  // Create team
  const team = await Team.create({
    name: data.name,
    mascot: data.mascot,
    members: memberIds,
  });
  
  return team.toObject();
}

export async function getLeaderboard() {
  const teams = await Activity.aggregate([
    { $group: { _id: '$team', totalPoints: { $sum: '$points' } } },
    {
      $lookup: {
        from: Team.collection.name,
        localField: '_id',
        foreignField: '_id',
        as: 'team',
      },
    },
    { $unwind: '$team' },
    { $sort: { totalPoints: -1, 'team.name': 1 } },
  ]);

  return teams.map(({ team, totalPoints }, index) => ({
    teamName: team.name,
    totalPoints,
    rank: index + 1,
  }));
}

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail }).lean();
  if (!user) {
    throw Object.assign(new Error('User not found'), { status: 404 });
  }

  const [activity] = await Activity.find({ user: user._id })
    .sort({ occurredAt: -1 })
    .limit(1)
    .lean();
  const workouts = await Workout.find({ focus: user.fitnessGoal }).lean();

  return workouts.map(workout => ({
    ...workout,
    reason: activity
      ? `Recommended based on your ${activity.type} activity and ${user.fitnessGoal} goal.`
      : `Recommended based on your ${user.fitnessGoal} fitness goal.`,
  }));
}

export { User };
