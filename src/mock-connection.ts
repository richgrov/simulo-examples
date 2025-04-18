export default class MockRobotConnection {
  constructor(private ip: string) {}

  move = (x: number, y: number, z: number) => {};

  emote = (emoteId: number) => {};

  dispose() {}
}
