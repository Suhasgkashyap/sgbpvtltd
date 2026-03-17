import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useEffect } from "react";
import { Page } from "../App";

const WHATSAPP_NUMBER = "919999999999";

const categories = [
  { name: "Farm Equipment", icon: "🚜", desc: "Brush cutter trolleys, cycle weeders, and essential farm tools from SGB Agro Industries." },
  { name: "Brush Cutters", icon: "⚙️", desc: "SGB BC-520 and G45L professional brush cutters for efficient land clearing and weed control." },
  { name: "Carts & Barrows", icon: "🛒", desc: "Heavy-duty carry carts and wheel barrows for transporting farm materials and produce." },
];

interface HomePageProps {
  setPage: (p: Page) => void;
  setLoginRole: (r: string | null) => void;
}

export function HomePage({ setPage, setLoginRole }: HomePageProps) {
  const products = useQuery(api.products.list);
  const seedProducts = useMutation(api.products.seedProducts);
  const migrateToActualProducts = useMutation(api.products.migrateToActualProducts);
  const forceRefreshProducts = useMutation(api.products.forceRefreshProducts);

  useEffect(() => {
    void forceRefreshProducts().then(() => void migrateToActualProducts()).then(() => void seedProducts());
  }, []);

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative text-white overflow-hidden min-h-[520px] md:min-h-[600px] flex items-center">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1600&q=80&auto=format&fit=crop"
            alt="Indian farm field"
            className="w-full h-full object-cover"
          />
          {/* Dark green overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-green-900/85 via-green-800/70 to-green-700/40"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-28 w-full">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              <span>🌿</span> Trusted by farmers & industries across India
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight drop-shadow-lg">
              SGB Pvt. Ltd.
              <span className="block text-green-200 text-3xl md:text-4xl font-normal mt-2">Hardware & Agro Products</span>
            </h1>
            <p className="text-lg md:text-xl text-green-100 mb-8 max-w-2xl drop-shadow">
              Premium quality agricultural films, packaging solutions, irrigation systems, and hardware products. Serving farmers and industries with excellence since decades.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="#products" className="px-8 py-3 bg-white text-green-700 font-semibold rounded-lg hover:bg-green-50 transition-colors shadow-lg">
                View Products
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="relative py-16" id="categories">
        {/* Subtle farm background */}
        <div className="absolute inset-0">
          <img
            src="https://img.freepik.com/premium-vector/agriculture-farming-landscape-countryside-land-tractor-plowing-field-rural-landscape-background-farm-life-soil-cultivation-process-vector-cartoon-illustration_87946-6253.jpg?semt=ais_rp_progressive&w=740&q=80"
            alt="farm background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gray-50/92"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-3">Product Categories</h2>
            <p className="text-gray-600 mb-4">We offer a comprehensive range of products for agriculture, packaging, irrigation, and hardware needs.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {categories.map((cat) => (
              <div key={cat.name} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100 text-center">
                <div className="text-4xl mb-4">{cat.icon}</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{cat.name}</h3>
                <p className="text-gray-500 text-sm">{cat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="py-16" id="products">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-3">Our Products</h2>
            <p className="text-gray-500 max-w-xl mx-auto">High-quality products sourced and tested for agricultural and industrial applications.</p>
          </div>
          {products === undefined ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <div key={product._id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 overflow-hidden group">
                  <div className="h-48 bg-white flex items-center justify-center overflow-hidden border-b border-gray-100 p-3">
                    {product.imageUrl ? (
                      <img 
                        src={product.imageUrl} 
                        alt={product.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement!.innerHTML = `<div class="text-5xl">${
                            product.category === "Farm Equipment" ? "🚜" :
                            product.category === "Brush Cutters" ? "⚙️" :
                            product.category === "Carts & Barrows" ? "🛒" : "🔧"
                          }</div>`;
                        }}
                      />
                    ) : (
                      <div className="text-5xl">
                        {product.category === "Farm Equipment" ? "🚜" :
                         product.category === "Brush Cutters" ? "⚙️" :
                         product.category === "Carts & Barrows" ? "🛒" : "🔧"}
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{product.category}</span>
                    <h3 className="font-semibold text-gray-800 mt-2 mb-1">{product.name}</h3>
                    <p className="text-gray-500 text-xs mb-3 line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-green-700 font-bold">₹{product.price.toLocaleString()}<span className="text-gray-400 font-normal text-xs">/{product.unit}</span></span>
                      <span className="text-xs text-gray-400">Stock: {product.stock}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Stats banner */}
      <section className="relative py-14 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=1600&q=75&auto=format&fit=crop"
            alt="Indian farmer in field"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-green-900/75"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-white text-center">
            {[
              { value: "6+", label: "Product Lines" },
              { value: "1000+", label: "Happy Customers" },
              { value: "Pan India", label: "Delivery" },
              { value: "10+ Yrs", label: "Experience" },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-3xl md:text-4xl font-bold text-green-300">{s.value}</div>
                <div className="text-sm text-green-100 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section className="relative py-16" id="about">
        {/* Background */}
        <div className="absolute inset-0">
          <img
            src="https://static.vecteezy.com/system/resources/thumbnails/072/606/508/small/green-grass-field-with-blue-sky-and-clouds-free-photo.jpg"
            alt="agriculture background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gray-50/93"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">About SGB Pvt. Ltd.</h2>
              <p className="text-gray-600 mb-4">
                SGB Pvt. Ltd. (SGB Agro Industries) is a leading supplier of hardware and agro products in India. We offer agricultural films, packaging materials, irrigation systems, farm equipment including brush cutters, wheel barrows, carry carts, and cycle weeders—plus industrial hardware for farmers and businesses nationwide.
              </p>
              <p className="text-gray-600 mb-6">
                Our products are sourced from trusted manufacturers and tested for quality and durability. From SGB Brush Cutter Trolleys to drip irrigation pipes, we are committed to supporting Indian agriculture with modern, cost-effective solutions that improve productivity and reduce waste.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: "✅", text: "Quality Assured Products" },
                  { icon: "🚚", text: "Pan-India Delivery" },
                  { icon: "💬", text: "WhatsApp Ordering" },
                  { icon: "🤝", text: "Trusted by 1000+ Customers" },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-2 text-gray-700">
                    <span>{item.icon}</span>
                    <span className="text-sm font-medium">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Image + WhatsApp card */}
            <div className="space-y-4">
              <div className="rounded-2xl overflow-hidden shadow-lg h-52">
                <img
                  src="https://img.freepik.com/free-photo/agriculture-iot-with-rice-field-background_53876-124635.jpg?semt=ais_hybrid&w=740&q=80"
                  alt="Farm equipment in use"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="bg-gradient-to-br from-green-600 to-emerald-500 rounded-2xl p-6 text-white">
                <h3 className="text-xl font-bold mb-4">Order via WhatsApp</h3>
                <p className="text-green-100 mb-4 text-sm">Send us your requirements on WhatsApp and our billing team will process your order immediately.</p>
                <div className="space-y-2 text-sm">
                  {[
                    { n: "1️⃣", t: "Send product list on WhatsApp" },
                    { n: "2️⃣", t: "Billing team creates your invoice" },
                    { n: "3️⃣", t: "Order packed and dispatched" },
                    { n: "4️⃣", t: "Track your shipment with ID" },
                  ].map((s) => (
                    <div key={s.n} className="flex items-center gap-3 bg-white/10 rounded-lg p-2.5">
                      <span>{s.n}</span>
                      <span>{s.t}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="text-white font-bold text-lg mb-2">🌿 SGB Pvt. Ltd.</div>
          <p className="text-sm">Hardware & Agro Products | Quality You Can Trust</p>
          <p className="text-xs mt-4">© 2025 SGB Pvt. Ltd. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
