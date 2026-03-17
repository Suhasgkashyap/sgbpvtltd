import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";

export function ProductsManager() {
  const products = useQuery(api.products.listAll);
  const create = useMutation(api.products.create);
  const update = useMutation(api.products.update);
  const remove = useMutation(api.products.remove);
  const seedProducts = useMutation(api.products.seedProducts);
  const replaceWithActualProducts = useMutation(api.products.replaceWithActualProducts);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<Id<"products"> | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const filtered = products?.filter((p) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(s) ||
      p.category.toLowerCase().includes(s) ||
      p.description.toLowerCase().includes(s)
    );
  });

  const handleSeed = async () => {
    try {
      await seedProducts({});
      toast.success("Products seeded successfully");
    } catch {
      toast.error("Failed to seed products");
    }
  };

  const handleReplace = async () => {
    if (!confirm("Replace all products with actual SGB Agro Industries products? This will remove existing products.")) return;
    try {
      await replaceWithActualProducts({});
      toast.success("Replaced with actual SGB products");
    } catch {
      toast.error("Only admin can replace products");
    }
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    try {
      await create({
        name: fd.get("name") as string,
        category: fd.get("category") as string,
        description: fd.get("description") as string,
        price: Number(fd.get("price")),
        unit: fd.get("unit") as string,
        stock: Number(fd.get("stock")),
      });
      toast.success("Product added");
      setShowAdd(false);
      form.reset();
    } catch {
      toast.error("Failed to add product");
    }
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>, id: Id<"products">) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    try {
      await update({
        id,
        name: fd.get("name") as string,
        category: fd.get("category") as string,
        description: fd.get("description") as string,
        price: Number(fd.get("price")),
        unit: fd.get("unit") as string,
        stock: Number(fd.get("stock")),
        isActive: fd.get("isActive") === "on",
      });
      toast.success("Product updated");
      setEditingId(null);
    } catch {
      toast.error("Failed to update product");
    }
  };

  const handleRemove = async (id: Id<"products">) => {
    try {
      await remove({ id });
      toast.success("Product deactivated");
    } catch {
      toast.error("Failed to deactivate product");
    }
  };

  if (products === undefined) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
        />
        <button
          onClick={() => setShowAdd(true)}
          className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium"
        >
          + Add Product
        </button>
        {products.length === 0 ? (
          <button
            onClick={handleSeed}
            className="px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium"
          >
            Seed SGB Products
          </button>
        ) : (
          <button
            onClick={handleReplace}
            className="px-4 py-2.5 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg text-sm font-medium"
          >
            Replace with actual SGB products
          </button>
        )}
      </div>

      {showAdd && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
          <h3 className="font-semibold text-gray-800 mb-3">Add New Product</h3>
          <form onSubmit={handleCreate} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <input name="name" placeholder="Name" required className="px-3 py-2 border rounded-lg text-sm" />
            <input name="category" placeholder="Category" required className="px-3 py-2 border rounded-lg text-sm" />
            <input name="description" placeholder="Description" className="px-3 py-2 border rounded-lg text-sm" />
            <input name="price" type="number" placeholder="Price" required min={0} step={0.01} className="px-3 py-2 border rounded-lg text-sm" />
            <input name="unit" placeholder="Unit (e.g. piece, kg)" required className="px-3 py-2 border rounded-lg text-sm" />
            <input name="stock" type="number" placeholder="Stock" required min={0} className="px-3 py-2 border rounded-lg text-sm" />
            <div className="sm:col-span-2 flex gap-2">
              <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm">
                Save
              </button>
              <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 bg-gray-200 rounded-lg text-sm">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {filtered?.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-4xl mb-3">🛒</div>
          <p>No products found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered?.map((p) => (
            <div
              key={p._id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow"
            >
              {editingId === p._id ? (
                <form onSubmit={(e) => handleUpdate(e, p._id)} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <input name="name" defaultValue={p.name} required className="px-3 py-2 border rounded-lg text-sm" />
                  <input name="category" defaultValue={p.category} required className="px-3 py-2 border rounded-lg text-sm" />
                  <input name="description" defaultValue={p.description} className="px-3 py-2 border rounded-lg text-sm" />
                  <input name="price" type="number" defaultValue={p.price} required min={0} step={0.01} className="px-3 py-2 border rounded-lg text-sm" />
                  <input name="unit" defaultValue={p.unit} required className="px-3 py-2 border rounded-lg text-sm" />
                  <input name="stock" type="number" defaultValue={p.stock} required min={0} className="px-3 py-2 border rounded-lg text-sm" />
                  <label className="flex items-center gap-2 text-sm">
                    <input name="isActive" type="checkbox" defaultChecked={p.isActive} />
                    Active
                  </label>
                  <div className="flex gap-2">
                    <button type="submit" className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs">Save</button>
                    <button type="button" onClick={() => setEditingId(null)} className="px-3 py-1.5 bg-gray-200 rounded-lg text-xs">Cancel</button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="font-medium text-gray-800">{p.name}</div>
                    <div className="text-xs text-gray-500">{p.category}</div>
                    <div className="text-sm text-gray-600 mt-0.5">{p.description}</div>
                    <div className="text-sm mt-1">
                      ₹{p.price.toLocaleString()} / {p.unit} · Stock: {p.stock}
                      {!p.isActive && <span className="ml-2 text-red-600 text-xs">(inactive)</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingId(p._id)}
                      className="px-3 py-1.5 text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg"
                    >
                      Edit
                    </button>
                    {p.isActive && (
                      <button
                        onClick={() => handleRemove(p._id)}
                        className="px-3 py-1.5 text-xs font-medium bg-red-50 hover:bg-red-100 text-red-600 rounded-lg"
                      >
                        Deactivate
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
