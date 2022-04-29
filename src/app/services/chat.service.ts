import { Injectable } from '@angular/core';
import {AuthService} from "./auth.service";
import {addDoc, collection, Firestore} from "@angular/fire/firestore";

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor(private auth: AuthService, private afs: Firestore) { }

  async create() {
    const { uid } = await this.auth.getUser()
    const collectionRef = collection(this.afs, 'chats')
    return addDoc(collectionRef, {
      createdAt: Date.now(),
      owner: uid,
      members: [uid]
    })

  }
}
