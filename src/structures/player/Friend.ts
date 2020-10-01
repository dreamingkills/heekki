export class Friend {
  id: number;
  sender: string;
  recipient: string;
  confirmed: boolean;
  constructor(data: {
    relationship_id: number;
    sender_id: string;
    friend_id: string;
    confirmed: boolean;
  }) {
    this.id = data.relationship_id;
    this.sender = data.sender_id;
    this.recipient = data.friend_id;
    this.confirmed = data.confirmed;
  }
}
