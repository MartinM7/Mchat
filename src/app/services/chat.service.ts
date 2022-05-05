import { Injectable } from '@angular/core';
import {AuthService} from "./auth.service";
import {
  addDoc,
  collection,
  collectionChanges, collectionData,
  collectionSnapshots, doc,
  Firestore, limitToLast, orderBy,
  query, setDoc,
  where
} from "@angular/fire/firestore";
import {map, Observable, switchMap} from "rxjs";
import firebase from "firebase/compat";
import User = firebase.User;
import {Chat} from "./chat.model";
import {Message} from "./message.model";

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

  get(chatId: any) {
    return collectionData(
      query(
        collection(this.afs, 'chats', chatId, 'messages'),
        orderBy('createdAt'),limitToLast(10)
      ),{ idField: 'msgId' }
    ) as Observable<Message[]>
  }

  async addMessage(chatId: any, msg: string) {
    const id = doc(collection(this.afs, 'chats', chatId, 'messages')).id;
    return setDoc(doc(this.afs, 'chats', chatId, 'messages', id), {
      sender: await this.auth.getUser(),
      createdAt: Date.now(),
      text: msg
    })

  }

  getUserChats() {
    return this.auth.user$.pipe(
      switchMap(user => {
        return collectionSnapshots(
          query(
            collection(this.afs, 'chats'),
            where('owner', '==', user?.uid)
          )
        ).pipe(
          map(actions => {
            return actions.map(a => {
              const data: Object = a.data()
              const id = a.id
              return {id, ...data}
            })
          })
        )
      })
    )
  }
}
