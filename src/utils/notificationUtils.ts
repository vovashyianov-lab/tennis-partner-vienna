import { Availability, Location, Notification, GameProposal, Player } from '../types';

// Check whether two availabilities share at least one location and one overlapping time slot.
export function checkAvailabilitiesMatch(
  a: Availability,
  b: Availability,
  _locations: Location[]  // reserved for future proximity matching
): { timeMatch: boolean; locationMatch: boolean } {
  const sharedLocation = a.locations.some(id => b.locations.includes(id));

  const timeMatch = a.timeSlots.some(slotA =>
    b.timeSlots.some(slotB => {
      if (slotA.day !== slotB.day) return false;
      const aStart = toMinutes(slotA.startTime);
      const aEnd   = toMinutes(slotA.endTime);
      const bStart = toMinutes(slotB.startTime);
      const bEnd   = toMinutes(slotB.endTime);
      return aStart < bEnd && aEnd > bStart; // any overlap
    })
  );

  return { timeMatch, locationMatch: sharedLocation };
}

export function createAvailabilityMatchNotification(
  matchedAvailability: Availability,
  userId: string,
  locations: Location[]
): Notification {
  const locationNames = matchedAvailability.locations
    .map(id => locations.find(l => l.id === id)?.name)
    .filter(Boolean)
    .join(', ');

  return {
    id: crypto.randomUUID(),
    user_id: userId,
    type: 'match_found',
    title: 'Availability match found!',
    message: `${matchedAvailability.player.name} is available to play at ${locationNames || 'a shared location'}.`,
    created_at: new Date().toISOString(),
    read: false,
    hidden: false,
    availability_id: matchedAvailability.id,
  };
}

export function createGameInvitationNotification(
  game: GameProposal,
  fromPlayer: Player,
  toUserId: string,
  locationName: string
): Omit<Notification, 'id'> {
  const date = new Date(game.date).toLocaleDateString('en-AT', {
    weekday: 'short', day: 'numeric', month: 'short'
  });

  return {
    user_id: toUserId,
    type: 'game_invitation',
    title: 'Game invitation',
    message: `${fromPlayer.name} invited you to a tennis match on ${date} at ${locationName}.`,
    created_at: new Date().toISOString(),
    read: false,
    hidden: false,
    game_id: game.id,
  };
}

function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}
