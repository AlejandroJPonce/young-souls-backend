import firebaseAdmin, { firestore } from 'firebase-admin';
import environment from '../utils/environment';

type PathReferenceType = 'collection' | 'doc';

export class FirebaseClient {
    private static _instance: FirebaseClient;
    private static firestore: firestore.Firestore;
    private static _initialized: boolean = false;


    private constructor() {
        this.init();
    }

    private init() {
        if (FirebaseClient._initialized) {
            return;
        }
        FirebaseClient.firestore = firestore();
        FirebaseClient._initialized = true;
        const config = {
            apiKey: environment.FIREBASE_API_KEY,
            authDomain: environment.FIREBASE_AUTH_DOMAIN,
            projectId: environment.FIREBASE_PROJECT_ID,
            storageBucket: environment.FIREBASE_STORAGE_BUCKET,
            messagingSenderId: environment.FIREBASE_MESSAGING_SENDER_ID,
            appId: environment.FIREBASE_APP_ID,
        };
        firebaseAdmin.initializeApp(config);
    }

    public static bootstrap() {
        if (!FirebaseClient._initialized) {
            FirebaseClient._instance = new FirebaseClient();
        }
        return FirebaseClient._instance;    
    }

    private validateInitialization() {
        if (!FirebaseClient._initialized) {
            throw new Error('Firebase is not initialized');
        }
    }

    public static getReference(type: PathReferenceType, path: string) {
        FirebaseClient._instance.validateInitialization();
        
        if (type == 'collection') {
           return FirebaseClient.firestore.collection(path);
        } else {
           return FirebaseClient.firestore.doc(path);
        }
    }

    public static async getCollection<T = Record<string, any>>(path: string, where?: any[]): Promise<T[]> {
        FirebaseClient._instance.validateInitialization();

        const reference = FirebaseClient.getReference('collection', path) as firestore.CollectionReference;

        const querySnapshot = !where ? await reference.get() : await reference.where(
            where[0] as string,
            where[1] as FirebaseFirestore.WhereFilterOp,
            where[2] as Boolean
        ).get();

        const records: T[] = [];

        querySnapshot.forEach((doc: firestore.DocumentData) => {
            const props = doc.data();
            
            props.createdAt = props.createdAt ? props.createdAt.toDate() : undefined;
            props.assignedAt = props.assignedAt ? props.assignedAt.toDate() : undefined;
            props.startAt = props.startAt ? new Date(props.startAt) : undefined;
            props.untilAt = props.untilAt ? new Date(props.untilAt) : undefined;

            for (const key in props) {
                if (props[key] instanceof firestore.DocumentReference) {
                    delete props[key];
                }
            }

            records.push({ id: doc.id, ...props } as T);
        });

        return records;
    }


}