// This code only works if there is only one DS18B20 connected
// Returns the temperature, or -100 in case of an error

#include <node.h>
#include <uv.h>

#include "stdio.h"
#include "iostream"
#include <v8.h>
#include "mraa.hpp"

#include <chrono>
#include <thread>
#include <future>

using namespace v8;

// How long to wait for the measurement to finish.
std::chrono::milliseconds WAIT_MEASUREMENT = std::chrono::milliseconds(1000);
// Commands
uint8_t START_MEASUREMENT = 0x44;
uint8_t READ_MEASUREMENT = 0xBE;

struct Work {
  uv_work_t  request;
  Persistent<Function> callback;
  FunctionCallbackInfo<Value>* _args;

  float *results;
};

static void WorkAsyncComplete(uv_work_t *req,int status)
{
    Isolate * isolate = Isolate::GetCurrent();
    v8::HandleScope handleScope(isolate); // Required for Node 4.x
    
    Work *work = static_cast<Work *>(req->data);
    Local<Object> result = Object::New(isolate);

    double argu = static_cast<double>(*(work->results));
    
    result->Set(String::NewFromUtf8(isolate, "result"), 
                            Number::New(isolate, argu));

    // set up return arguments
    Handle<Value> argc = result;

    // execute the callback
    Local<Function>::New(isolate, work->callback)->
      Call(isolate->GetCurrentContext()->Global(), 1, &argc);

   // Free up the persistent function callback
    work->callback.Reset();

    delete work;
}



static void read(uv_work_t *req){
   Work *work = static_cast<Work *>(req->data);
  try {

      mraa::UartOW *uart = new mraa::UartOW(0);
      mraa::Result rv;

    if ((rv = uart->reset()) != mraa::SUCCESS)
    {
      throw std::invalid_argument("Reset failed, returned ");
    }
       // start the search from scratch
    std::string id = uart->search(true);

    if (id.empty())
    {
      throw std::invalid_argument("No devices detected!");

    }

    if ((rv = uart->reset()) != mraa::SUCCESS){

    }
    
    if (uart->command(START_MEASUREMENT, id) == mraa::SUCCESS){
      // Needed time depends on resolution, 1000ms is probably overkill
      std::this_thread::sleep_for(WAIT_MEASUREMENT);
      if ((rv = uart->reset()) != mraa::SUCCESS){

      }
      uart->command(READ_MEASUREMENT, id);
      uint8_t data[9];
      for ( unsigned int i=0; i<9; ++i){
        data[i]=uart->readByte();
      }
      // Convert binary to celsius
      float temp = ( (data[1] << 8) + data[0] )*0.0625;
      
      // Return the temperature
      work->results = new float(temp);
      
    }
    else{
      throw std::invalid_argument("Readerror");

    }



    delete uart;

  }catch (std::exception &e){
    std::cout << e.what() << std::endl;
    
    work->results = new float(-100);

  }
  
}

void Method(const v8::FunctionCallbackInfo<v8::Value>& args) {
  Isolate* isolate = args.GetIsolate();
  HandleScope scope(isolate);

  Work * work = new Work();
  work->request.data = work;
  work->_args = new v8::FunctionCallbackInfo<v8::Value>(args);

  // store the callback from JS in the work package so we can 
  // invoke it later
  Local<Function> callback = Local<Function>::Cast(args[0]);
  work->callback.Reset(isolate, callback);

  // kick of the worker thread
  uv_queue_work(uv_default_loop(),&work->request,
      read,WorkAsyncComplete);

  args.GetReturnValue().Set(Undefined(isolate));

}



void init(v8::Local<v8::Object> target) {
NODE_SET_METHOD(target, "read", Method);
}

NODE_MODULE(binding, init);

