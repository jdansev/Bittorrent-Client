



/* Requested List

- Tracks which pieces are already requested
- A single list shared by all TCP peer connections

*/

export class RequestedList {

  constructor() {
    this._requested = [];
  }

  add = request => {
    this._requested.push(request);
  }

  getAll = () => {
    return this._requested;
  }

}



