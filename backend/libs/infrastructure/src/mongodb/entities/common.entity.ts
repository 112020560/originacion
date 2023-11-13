/* eslint-disable prettier/prettier */
import { Column, ObjectId, ObjectIdColumn } from "typeorm";

export class CommonDocument {
  @ObjectIdColumn()
  id?: ObjectId;

  @Column()
  CreatedAt: Date;
}
