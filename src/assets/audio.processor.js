// evaluated in AudioWorkletGlobalScope upon
// audioWorklet.addModule() call in the main global scope.
class AudioStreamProcessor extends AudioWorkletProcessor {

  cursor = 0;
  tail = 0;
  head = 0;
  bufferSize = 4096 * 4 * 600;
  sharedBuffer = new SharedArrayBuffer(this.bufferSize);
  sharedView = new Float32Array(this.sharedBuffer);

  static get parameterDescriptors() {
    return [{ name: 'head', defaultValue: 0 }];
  }

  constructor() {
    super();
    this.port.postMessage({
        eventType: 'buffer',
        buffer: this.sharedBuffer
    });
  }
  
  
  process(inputs, outputs, parameters) {

    this.head = parameters.head;
    
    if (this.tail == this.head) {
      console.error("WARN : full buffer overrun");
      return true;
    }
    let padded_head = this.head
    
    if (this.head < this.tail) {
      padded_head += this.sharedView.length
    }

    if ((padded_head - this.tail) < outputs[0][0].length) {
      // not enough data to write
      console.error("WARN : partial buffer overrun");
      return true;
    }

    for (let i = 0; i < outputs[0][0].length; i++) {
        outputs[0][0][i] = this.sharedView[(i + this.tail) % this.sharedView.length];
    }

    this.tail = (this.tail + outputs[0][0].length) % this.sharedView.length;

    return true;
  }

  endWrite(sizeWritten) {
    this.head = (this.head + sizeWritten) % this.sharedView
  }

}

registerProcessor('audio-processor', AudioStreamProcessor);
