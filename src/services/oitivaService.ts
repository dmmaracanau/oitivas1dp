import { 
  collection, 
  onSnapshot, 
  addDoc, 
  setDoc,
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { 
  ref as rtdbRef, 
  set as rtdbSet, 
  update as rtdbUpdate, 
  remove as rtdbRemove, 
  onValue as rtdbOnValue,
  get as rtdbGet
} from 'firebase/database';
import { db, rtdb, handleFirestoreError, OperationType } from '../firebase';
import { Oitiva } from '../types/oitiva';

const COLLECTION_NAME = 'oitivas';
const LOCAL_STORAGE_KEY = 'oitivas_agenda_data_v2';

// Remove propriedades undefined para evitar rejeição no Firebase
function sanitizePayload<T extends Record<string, any>>(obj: T): Record<string, any> {
  const result: Record<string, any> = {};
  for (const key of Object.keys(obj)) {
    if (obj[key] !== undefined) {
      result[key] = obj[key];
    }
  }
  return result;
}

// Helpers de cache local
function getLocalCache(): Oitiva[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setLocalCache(data: Oitiva[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.warn("Falha ao atualizar cache local:", err);
  }
}

// Sincroniza em background com o Firebase Realtime Database
async function syncToRealtimeDatabase(oitivas: Oitiva[]) {
  try {
    if (!rtdb) return;
    const dbRef = rtdbRef(rtdb, 'oitivas');
    if (oitivas.length === 0) {
      await rtdbSet(dbRef, null);
      return;
    }
    const rtdbMap: Record<string, any> = {};
    for (const item of oitivas) {
      rtdbMap[item.id] = sanitizePayload(item);
    }
    await rtdbSet(dbRef, rtdbMap);
  } catch (err) {
    console.warn("Sincronização com Realtime Database (rtdb):", err);
  }
}

export const oitivaService = {
  // Assinatura em tempo real - escuta mudanças no Firestore e Realtime Database
  subscribe(
    onData: (oitivas: Oitiva[]) => void, 
    onError?: (err: Error) => void,
    onStatusChange?: (status: 'connected' | 'syncing' | 'offline') => void
  ) {
    if (onStatusChange) onStatusChange('syncing');

    // Emite o cache local imediatamente para renderização rápida
    const cached = getLocalCache();
    if (cached.length > 0) {
      onData(cached);
    }

    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('date', 'asc'));

      const unsubscribe = onSnapshot(
        q,
        async (snapshot) => {
          if (onStatusChange) onStatusChange('connected');

          if (snapshot.empty) {
            setLocalCache([]);
            onData([]);
            syncToRealtimeDatabase([]);
            return;
          }

          const items: Oitiva[] = [];
          snapshot.forEach((docSnap) => {
            const d = docSnap.data();
            items.push({
              id: docSnap.id,
              personName: d.personName || 'Sem nome',
              date: d.date || '',
              time: d.time || '',
              procedureNumber: d.procedureNumber || '',
              procedureType: d.procedureType || '',
              role: d.role || 'Testemunha',
              cpf: d.cpf || '',
              rg: d.rg || '',
              phone: d.phone || '',
              email: d.email || '',
              address: d.address || '',
              neighborhood: d.neighborhood || '',
              city: d.city || '',
              officerName: d.officerName || '',
              clerkName: d.clerkName || '',
              modality: d.modality || 'Presencial',
              locationOrLink: d.locationOrLink || '',
              status: d.status || 'Agendada',
              notes: d.notes || '',
              intimationSent: Boolean(d.intimationSent),
              googleCalendarEventId: d.googleCalendarEventId || '',
              googleDriveDocId: d.googleDriveDocId || '',
              googleDriveDocUrl: d.googleDriveDocUrl || '',
              lastGmailSentAt: d.lastGmailSentAt || undefined,
              createdAt: typeof d.createdAt === 'number' ? d.createdAt : Date.now(),
              updatedAt: typeof d.updatedAt === 'number' ? d.updatedAt : Date.now(),
              createdBy: d.createdBy || ''
            });
          });

          // Ordenação secundária por horário
          items.sort((a, b) => {
            const dateComp = a.date.localeCompare(b.date);
            if (dateComp !== 0) return dateComp;
            return (a.time || '00:00').localeCompare(b.time || '00:00');
          });

          setLocalCache(items);
          onData(items);

          // Sincroniza em tempo real com o Realtime Database no nó /oitivas
          syncToRealtimeDatabase(items);
        },
        (firestoreErr) => {
          handleFirestoreError(firestoreErr, OperationType.LIST, COLLECTION_NAME);
          if (onStatusChange) onStatusChange('offline');
          if (onError) onError(firestoreErr);

          // Tenta ler do Realtime Database como fallback se disponível
          try {
            if (rtdb) {
              const rRef = rtdbRef(rtdb, 'oitivas');
              rtdbGet(rRef).then((snap) => {
                if (snap.exists()) {
                  const val = snap.val();
                  const rtdbItems: Oitiva[] = Object.values(val);
                  setLocalCache(rtdbItems);
                  onData(rtdbItems);
                  if (onStatusChange) onStatusChange('connected');
                  return;
                }
              }).catch(() => {});
            }
          } catch {
            // Segue para fallback de cache local
          }

          // Fallback para cache local existente sem re-gerar mocks
          const localItems = getLocalCache();
          onData(localItems);
        }
      );

      return unsubscribe;
    } catch (err: any) {
      handleFirestoreError(err, OperationType.LIST, COLLECTION_NAME);
      if (onStatusChange) onStatusChange('offline');
      if (onError) onError(err);
      return () => {};
    }
  },

  // Criar nova oitiva no Firestore e Realtime Database em tempo real
  async create(data: Omit<Oitiva, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const payload: Omit<Oitiva, 'id'> = {
      ...data,
      personName: data.personName.trim(),
      date: data.date || new Date().toISOString().split('T')[0],
      time: data.time || '10:00',
      status: data.status || 'Agendada',
      intimationSent: Boolean(data.intimationSent),
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    const sanitized = sanitizePayload(payload);

    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), sanitized);
      const newId = docRef.id;

      // Grava no Realtime Database em paralelo
      try {
        if (rtdb) {
          const itemRef = rtdbRef(rtdb, `oitivas/${newId}`);
          await rtdbSet(itemRef, { ...sanitized, id: newId });
        }
      } catch (rtdbErr) {
        console.warn("RTDB create sync:", rtdbErr);
      }

      return newId;
    } catch (err: any) {
      handleFirestoreError(err, OperationType.CREATE, COLLECTION_NAME);
      
      const localId = `local_${Date.now()}`;
      const current = getLocalCache();
      const newItems = [{ ...payload, id: localId }, ...current];
      setLocalCache(newItems);

      // Tenta gravar no RTDB
      try {
        if (rtdb) {
          const itemRef = rtdbRef(rtdb, `oitivas/${localId}`);
          await rtdbSet(itemRef, { ...sanitized, id: localId });
        }
      } catch {}

      return localId;
    }
  },

  // Atualizar oitiva existente no Firestore e Realtime Database
  async update(id: string, data: Partial<Omit<Oitiva, 'id'>>): Promise<void> {
    const updatePayload = sanitizePayload({
      ...data,
      updatedAt: Date.now()
    });

    // Atualização otimista no cache local
    const current = getLocalCache();
    const updated = current.map(item => item.id === id ? { ...item, ...updatePayload } : item);
    setLocalCache(updated);

    // Atualiza no Realtime Database
    try {
      if (rtdb) {
        const itemRef = rtdbRef(rtdb, `oitivas/${id}`);
        await rtdbUpdate(itemRef, updatePayload);
      }
    } catch (rtdbErr) {
      console.warn("RTDB update sync:", rtdbErr);
    }

    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await setDoc(docRef, updatePayload, { merge: true });
    } catch (err: any) {
      console.warn("Firestore update notice:", err);
      handleFirestoreError(err, OperationType.UPDATE, `${COLLECTION_NAME}/${id}`);
    }
  },

  // Excluir oitiva do Firestore e Realtime Database em tempo real
  async delete(id: string): Promise<void> {
    // Atualização otimista imediata no cache local
    const current = getLocalCache();
    const updated = current.filter(item => item.id !== id);
    setLocalCache(updated);

    // Exclui do Realtime Database
    try {
      if (rtdb) {
        const itemRef = rtdbRef(rtdb, `oitivas/${id}`);
        await rtdbRemove(itemRef);
      }
    } catch (rtdbErr) {
      console.warn("RTDB delete sync:", rtdbErr);
    }

    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (err: any) {
      console.warn("Firestore delete notice:", err);
      handleFirestoreError(err, OperationType.DELETE, `${COLLECTION_NAME}/${id}`);
    }
  },

  // Carregar todos os dados uma vez (forçar sincronização)
  async getAll(): Promise<Oitiva[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('date', 'asc'));
      const snapshot = await getDocs(q);
      const items: Oitiva[] = [];
      snapshot.forEach(docSnap => {
        const d = docSnap.data();
        items.push({
          id: docSnap.id,
          personName: d.personName || '',
          date: d.date || '',
          time: d.time || '',
          procedureNumber: d.procedureNumber || '',
          procedureType: d.procedureType || '',
          role: d.role || '',
          cpf: d.cpf || '',
          rg: d.rg || '',
          phone: d.phone || '',
          email: d.email || '',
          address: d.address || '',
          neighborhood: d.neighborhood || '',
          city: d.city || '',
          officerName: d.officerName || '',
          clerkName: d.clerkName || '',
          modality: d.modality || 'Presencial',
          locationOrLink: d.locationOrLink || '',
          status: d.status || 'Agendada',
          notes: d.notes || '',
          intimationSent: Boolean(d.intimationSent),
          googleCalendarEventId: d.googleCalendarEventId || '',
          googleDriveDocId: d.googleDriveDocId || '',
          googleDriveDocUrl: d.googleDriveDocUrl || '',
          lastGmailSentAt: d.lastGmailSentAt || undefined,
          createdAt: d.createdAt || Date.now(),
          updatedAt: d.updatedAt || Date.now(),
          createdBy: d.createdBy || ''
        });
      });
      setLocalCache(items);
      syncToRealtimeDatabase(items);
      return items;
    } catch (err: any) {
      handleFirestoreError(err, OperationType.GET, COLLECTION_NAME);
      return getLocalCache();
    }
  }
};

