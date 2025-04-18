export default class MockRobotConnection {
  constructor(
    // @ts-ignore
    private ip: string,
    // @ts-ignore
    private connectHandler: () => void,
    public errorHandler: (error: any) => void
  ) {}

  // @ts-ignore
  move = (x: number, y: number, z: number) => {};

  // @ts-ignore
  emote = (emoteId: number) => {};

  dispose() {}
}
