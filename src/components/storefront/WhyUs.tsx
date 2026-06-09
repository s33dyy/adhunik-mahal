import { Award, Truck, ShieldCheck, MessageCircle } from "lucide-react";

const items = [
  { icon: Award, title: "Handloom Certified", text: "Every saree sourced direct from master weavers across Bengal, Tamil Nadu & Telangana." },
  { icon: Truck, title: "Free India Shipping", text: "Complimentary delivery across India. Dispatched within 24 hours from our Kolkata atelier." },
  { icon: ShieldCheck, title: "Cash on Delivery", text: "Pay when you receive. 7-day easy exchange on all unworn, unwashed pieces." },
  { icon: MessageCircle, title: "WhatsApp Concierge", text: "Personal styling, fabric queries & order updates — chat with our team anytime." },
];

export function WhyUs() {
  return (
    <section className="bg-secondary py-16 border-y border-border">
      <div className="container grid md:grid-cols-4 gap-8">
        {items.map((it, i) => (
          <div key={i} className="text-center md:text-left">
            <div className="inline-flex h-12 w-12 items-center justify-center bg-maroon text-primary-foreground mb-4">
              <it.icon className="h-5 w-5" />
            </div>
            <h3 className="font-display text-xl mb-1">{it.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{it.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
