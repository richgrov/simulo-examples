export default class MockRobotConnection {
  public errorHandler: (error: any) => void = console.error;

  constructor(private ip: string) {}

  move = (x: number, y: number, z: number) => {};

  emote = (emoteId: number) => {};

  dispose() {}
}
