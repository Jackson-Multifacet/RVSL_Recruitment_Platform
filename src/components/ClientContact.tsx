import * as React from 'react';
import { Mail, Phone, ExternalLink } from 'lucide-react';

export function ClientContact() {
  return (
    <section className="bg-slate-900 py-24">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-[3rem] p-12 md:p-20 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-6xl font-black font-display mb-6 leading-tight">
                Ready to Hire <br />
                The Best?
              </h2>
              <p className="text-xl text-orange-100 mb-10 max-w-md font-medium">
                Our executive search methodology is tailored to your specific needs. Let's build your dream team together.
              </p>
              <div className="flex flex-col sm:flex-row gap-6">
                <a href="mailto:info.realvalue@mail.com" className="flex items-center gap-3 text-lg font-bold hover:text-orange-200 transition-colors">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                    <Mail className="w-6 h-6" />
                  </div>
                  info.realvalue@mail.com
                </a>
                <a href="tel:08050221419" className="flex items-center gap-3 text-lg font-bold hover:text-orange-200 transition-colors">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                    <Phone className="w-6 h-6" />
                  </div>
                  08050221419
                </a>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/20">
              <h3 className="text-2xl font-bold mb-6">Request a Consultation</h3>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <input 
                  type="text" 
                  placeholder="Company Name" 
                  className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-2xl outline-none focus:bg-white/20 transition-all placeholder:text-orange-100"
                />
                <input 
                  type="email" 
                  placeholder="Work Email" 
                  className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-2xl outline-none focus:bg-white/20 transition-all placeholder:text-orange-100"
                />
                <textarea 
                  placeholder="Tell us about your hiring needs..." 
                  rows={4}
                  className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-2xl outline-none focus:bg-white/20 transition-all placeholder:text-orange-100 resize-none"
                />
                <button className="w-full py-5 bg-white text-orange-600 rounded-2xl font-black text-lg hover:bg-orange-50 transition-all shadow-xl flex items-center justify-center gap-2">
                  Send Request <ExternalLink className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
