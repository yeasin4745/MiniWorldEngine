import { Vector2 } from './Vector2';

export interface WorldObject {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly position: Vector2;
  readonly symbol: string;
  readonly blocking: boolean;
}
