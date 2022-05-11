import {Injectable} from '@angular/core';
import {AuthService} from "./auth.service";
import {
  addDoc,
  collection,
  collectionData,
  collectionSnapshots,
  doc, docSnapshots,
  Firestore,
  limitToLast,
  orderBy,
  query,
  setDoc,
  where
} from "@angular/fire/firestore";
import {map, Observable, of, switchMap} from "rxjs";
import {Message} from "./message.model";
import {Router} from "@angular/router";


@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor(private auth: AuthService, private afs: Firestore, private router: Router) { }

  async create() {
    const { uid } = await this.auth.getUser()
    const collectionRef = collection(this.afs, 'chats')
    return addDoc(collectionRef, {
      createdAt: Date.now(),
      owner: uid,
      members: [uid]
    })
  }

  get(chatId: any): Observable<Message[] | null> {
    const documentRef = doc(this.afs, 'chats', chatId)

    return docSnapshots(documentRef).pipe(
      switchMap((doc) => {
          if (doc.exists()) {
            return collectionData(
              query(
                collection(documentRef, 'messages'),
                orderBy('createdAt'), limitToLast(10)
              ), {idField: 'msgId'}
            ) as Observable<Message[]>
          }
          this.router.navigate(['/'])
          return of(null)
        }
      )
    )
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
