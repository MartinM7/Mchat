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
import {getDownloadURL, ref, Storage, uploadBytesResumable} from "@angular/fire/storage";
import {map, Observable, of, switchMap} from "rxjs";
import {Message} from "./message.model";
import {Router} from "@angular/router";


@Injectable({
  providedIn: 'root'
})
export class ChatService {

  audioURL: string | undefined | null;
  imageURL: string | undefined | null;

  constructor(private auth: AuthService, private afs: Firestore, private storage: Storage, private router: Router) { }

  async create() {
    const { uid } = await this.auth.getUser()
    const collectionRef = collection(this.afs, 'chats')
    return addDoc(collectionRef, {
      createdAt: Date.now(),
      owner: uid,
      members: [uid]
    }).catch(() => alert('You can only create a limited number of chats!'))
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

  async addMessage(chatId: string, msg: string, newAudio: Blob | null | undefined, imageFile: File | null | undefined) {

    this.audioURL = null
    this.imageURL = null

    const id = doc(collection(this.afs, 'chats', chatId, 'messages')).id

    if (newAudio) {

      const storageRef = ref(this.storage, `chats/${chatId}/${id}.wav`)
      await uploadBytesResumable(storageRef, newAudio)
      this.audioURL = await getDownloadURL(storageRef)

    }
    if (imageFile) {

      const ext = imageFile.name.split('.')
      const storageRef = ref(this.storage, `chats/${chatId}/${id}.${ext}`)
      await uploadBytesResumable(storageRef, imageFile)
      this.imageURL = await getDownloadURL(storageRef)

    }
    return setDoc(doc(this.afs, 'chats', chatId, 'messages', id), {
      sender: await this.auth.getUser(),
      createdAt: Date.now(),
      text: msg,
      audioURL: this.audioURL ?? null,
      imageURL: this.imageURL ?? null
    }).catch(() => alert('You can only create a limited number of messages!'))
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
