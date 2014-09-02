/**
 * Created by Никита on 30.07.2014.
 */
function Queue( approximatelyMax ){
    this.max = approximatelyMax;
    this.first = 0;
    this.last = 0;
    this.arr = [];
}

Queue.prototype.enqueue = function ( number ){
    this.arr[ this.last ] = number;
    this.last = ( this.last + 1 ) % this.max;
};

Queue.prototype.dequeue = function ( number ){
    var value = NaN;
    if( this.first != this.last ){
        value = this.arr[this.first];
    }
    this.first = ( this.first + 1 ) % this.max;
    return value;
};