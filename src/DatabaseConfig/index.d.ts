import {SQLiteDatabase} from 'react-native-sqlite-storage';

interface Options {
  dbName: string;
  location: string | null;
}

export function open(options: Options): Promise<SQLiteDatabase>;
