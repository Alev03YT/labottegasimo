import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

const productsCollection = collection(db, 'products')

export async function getProducts() {
  const q = query(productsCollection, orderBy('createdAt', 'desc'))
  const snapshot = await getDocs(q)

  return snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data()
  }))
}

export async function getProductById(id) {
  const ref = doc(db, 'products', id)
  const snapshot = await getDoc(ref)

  if (!snapshot.exists()) return null

  return {
    id: snapshot.id,
    ...snapshot.data()
  }
}

export async function createProduct(product) {
  return await addDoc(productsCollection, {
    ...product,
    createdAt: Date.now()
  })
}

export async function updateProduct(id, updates) {
  const ref = doc(db, 'products', id)
  await updateDoc(ref, updates)
}

export async function deleteProduct(id) {
  const ref = doc(db, 'products', id)
  await deleteDoc(ref)
}
