import {User} from "./user.model";

export interface Message {
  sender: User
  createdAt: number,
  text: string,
  msgId: string
}
