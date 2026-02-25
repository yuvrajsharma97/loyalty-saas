"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Button from "@/components/admin/Button";
import Input from "@/components/admin/Input";
import Banner from "@/components/admin/Banner";

export default function CreateStoreOwner() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    ownerName: "",
    ownerEmail: "",
    storeName: "",
    storeSlug: "",
    storeLocation: ""
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [newStoreId, setNewStoreId] = useState("");

  const validateForm = () => {
    const newErrors = {};

    if (!formData.ownerName.trim()) {
      newErrors.ownerName = "Owner name is required";
    }

    if (!formData.ownerEmail) {
      newErrors.ownerEmail = "Owner email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.ownerEmail)) {
      newErrors.ownerEmail = "Please enter a valid email address";
    }

    if (!formData.storeName.trim()) {
      newErrors.storeName = "Store name is required";
    }

    if (!formData.storeSlug.trim()) {
      newErrors.storeSlug = "Store slug is required";
    } else if (!/^[a-z0-9-]+$/.test(formData.storeSlug)) {
      newErrors.storeSlug =
      "Slug must contain only lowercase letters, numbers, and hyphens";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validateForm();
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setLoading(true);

      try {
        const response = await fetch("/api/admin/store-owner/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (!response.ok) {

          setLoading(false);
          if (data.details) {

            const zodErrors = {};
            data.details.forEach((err) => {
              zodErrors[err.path[0]] = err.message;
            });
            setErrors(zodErrors);
          } else {

            setErrors({ general: data.error || "Failed to create store owner" });
          }
          return;
        }


        setNewStoreId(data.data.store.id);
        setSuccess(true);
        setLoading(false);
      } catch (error) {
        console.error("Error creating store owner:", error);
        setLoading(false);
        setErrors({ general: "Network error. Please try again." });
      }
    }
  };

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));


    if (field === "storeName" && !formData.storeSlug) {
      setFormData((prev) => ({
        ...prev,
        storeSlug: value.
        toLowerCase().
        replace(/[^a-z0-9]/g, "-").
        replace(/-+/g, "-").
        trim("-")
      }));
    }


    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto">
        <Banner
          type="success"
          title="Store Owner Created Successfully"
          message={`${formData.storeName} has been created with owner ${formData.ownerName}.`}
          dismissible={false} />
        

        <div className="mt-6 flex gap-4 justify-center">
          <Link href={`/admin/store/${newStoreId}`}>
            <Button>View Store</Button>
          </Link>
          <Link href="/admin/stores">
            <Button variant="secondary">Back to Stores</Button>
          </Link>
        </div>
      </div>);

  }

  return (
    <div className="max-w-2xl mx-auto">
      {}
      <div className="mb-8">
        <Link
          href="/admin/stores"
          className="inline-flex items-center text-sm text-[#014421] dark:text-[#D0D8C3] hover:underline mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Stores
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Create Store Owner
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Create a new store owner account and associated store.
        </p>
      </div>

      {}
      <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-md p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {}
          {errors.general &&
          <Banner
            type="error"
            title="Error"
            message={errors.general}
            dismissible={true}
            onDismiss={() => setErrors((prev) => ({ ...prev, general: "" }))} />

          }

          {}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Owner Information
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Owner Name *
              </label>
              <Input
                value={formData.ownerName}
                onChange={handleChange("ownerName")}
                placeholder="Enter owner's full name"
                error={errors.ownerName} />
              
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Owner Email *
              </label>
              <Input
                type="email"
                value={formData.ownerEmail}
                onChange={handleChange("ownerEmail")}
                placeholder="Enter owner's email address"
                error={errors.ownerEmail} />
              
            </div>
          </div>

          {}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Store Information
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Store Name *
              </label>
              <Input
                value={formData.storeName}
                onChange={handleChange("storeName")}
                placeholder="Enter store name"
                error={errors.storeName} />
              
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Store Slug *
              </label>
              <Input
                value={formData.storeSlug}
                onChange={handleChange("storeSlug")}
                placeholder="store-slug-example"
                error={errors.storeSlug} />
              
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Used for URLs. Only lowercase letters, numbers, and hyphens
                allowed.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Store Location
              </label>
              <Input
                value={formData.storeLocation}
                onChange={handleChange("storeLocation")}
                placeholder="City, Country (optional)" />
              
            </div>
          </div>

          {}
          <div className="flex gap-4 pt-6">
            <Button type="submit" loading={loading} fullWidth>
              Create Owner & Store
            </Button>
            <Link href="/admin/stores" className="flex-1">
              <Button variant="ghost" fullWidth type="button">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>);

}