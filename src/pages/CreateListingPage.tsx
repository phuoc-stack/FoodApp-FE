import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock,
  Calendar,
  MapPin,
  DollarSign,
  Type,
  AlignLeft,
  ImagePlus,
  Loader,
  ArrowLeft,
} from "lucide-react";
import NavigationBar from "../components/NavigationBar";
import { fetchWithAuth } from "../utils/api";

interface CreateListingPageProps {
  cartCount: number;
}

const CreateListingPage: React.FC<CreateListingPageProps> = ({ cartCount }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [pickupStartDate, setPickupStartDate] = useState("");
  const [pickupStartTime, setPickupStartTime] = useState("");
  const [pickupEndDate, setPickupEndDate] = useState("");
  const [pickupEndTime, setPickupEndTime] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  // For future image upload feature
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const API_BASE_URL = "http://localhost:9393";

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match(/image\/(jpeg|jpg|png)/)) {
      setError("Please upload a JPG or PNG image");
      return;
    }
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }
    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError("");
  };

  const validateForm = (): boolean => {
    if (!title.trim()) {
      setError("Title is required");
      return false;
    }
    if (!description.trim()) {
      setError("Description is required");
      return false;
    }
    if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      setError("Please enter a valid price");
      return false;
    }
    if (!pickupStartDate || !pickupStartTime) {
      setError("Pickup start time is required");
      return false;
    }
    if (!pickupEndDate || !pickupEndTime) {
      setError("Pickup end time is required");
      return false;
    }
    if (!pickupAddress.trim()) {
      setError("Pickup address is required");
      return false;
    }
    // Validate that end time is after start time
    const startDateTime = new Date(`${pickupStartDate}T${pickupStartTime}`);
    const endDateTime = new Date(`${pickupEndDate}T${pickupEndTime}`);

    if (endDateTime <= startDateTime) {
      setError("Pickup end time must be after start time");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setError("");

    try {
      const pickupStartDateTime = `${pickupStartDate}T${pickupStartTime}`;
      const pickupEndDateTime = `${pickupEndDate}T${pickupEndTime}`; 

      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("price", price.toString());
      formData.append("pickupStartTime", pickupStartDateTime);
      formData.append("pickupEndTime", pickupEndDateTime);
      formData.append("pickupAddress", pickupAddress);
      if (selectedImage) {
        formData.append("image", selectedImage);
      }

      const response = await fetchWithAuth(`${API_BASE_URL}/api/listings`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create listing");
      }
      setSuccess("Listing created successfully!");

      // Reset form
      setTitle("");
      setDescription("");
      setPrice("");
      setPickupStartDate("");
      setPickupStartTime("");
      setPickupEndDate("");
      setPickupEndTime("");
      setPickupAddress("");
      setImageUrl("");
      setSelectedImage(null);
      setPreviewUrl("");

      // Redirect to my listings after a short delay
      setTimeout(() => {
        navigate("/my-listings");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create listing");
    } finally {
      setLoading(false);
    }
  };

  const getCurrentDate = () => {
    const now = new Date();
    return now.toISOString().split("T")[0];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar cartCount={cartCount} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/my-listings")}
            className="flex items-center text-gray-600 hover:text-orange-500 mb-4"
          >
            <ArrowLeft size={16} className="mr-1" />
            Back to My Listings
          </button>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create New Listing
          </h1>
          <p className="text-gray-600">
            Share your homemade food with the community
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 text-green-600 p-4 rounded-lg mb-6">
            {success}
          </div>
        )}

        {/* Listing Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl p-6 shadow-sm"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Basic Information */}
            <div className="md:col-span-2">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Basic Information
              </h2>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center gap-2">
                  <Type size={16} />
                  Listing Title <span className="text-red-500">*</span>
                </div>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="E.g., Homemade Lasagna, Fresh Baked Cookies"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center gap-2">
                  <AlignLeft size={16} />
                  Description <span className="text-red-500">*</span>
                </div>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your food item, ingredients, special features..."
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none resize-none"
                required
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center gap-2">
                  <DollarSign size={16} />
                  Price <span className="text-red-500">*</span>
                </div>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <DollarSign size={16} className="text-gray-500" />
                </div>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Pickup Information */}
            <div className="md:col-span-2 mt-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Pickup Information
              </h2>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  Pickup Start Date <span className="text-red-500">*</span>
                </div>
              </label>
              <input
                type="date"
                value={pickupStartDate}
                onChange={(e) => setPickupStartDate(e.target.value)}
                min={getCurrentDate()}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center gap-2">
                  <Clock size={16} />
                  Pickup Start Time <span className="text-red-500">*</span>
                </div>
              </label>
              <input
                type="time"
                value={pickupStartTime}
                onChange={(e) => setPickupStartTime(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  Pickup End Date <span className="text-red-500">*</span>
                </div>
              </label>
              <input
                type="date"
                value={pickupEndDate}
                onChange={(e) => setPickupEndDate(e.target.value)}
                min={pickupStartDate || getCurrentDate()}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center gap-2">
                  <Clock size={16} />
                  Pickup End Time <span className="text-red-500">*</span>
                </div>
              </label>
              <input
                type="time"
                value={pickupEndTime}
                onChange={(e) => setPickupEndTime(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center gap-2">
                  <MapPin size={16} />
                  Pickup Address <span className="text-red-500">*</span>
                </div>
              </label>
              <input
                type="text"
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                placeholder="Enter the address where buyers can pick up the food"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                required
              />
            </div>

            {/* Image Upload */}
            <div className="md:col-span-2 mt-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Image
              </h2>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center gap-2">
                  <ImagePlus size={16} />
                  Food Image
                </div>
              </label>

              {!previewUrl ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={handleImageSelect}
                    className="hidden"
                    id="food-image"
                  />
                  <label htmlFor="food-image" className="cursor-pointer">
                    <div className="flex flex-col items-center">
                      <ImagePlus size={48} className="text-gray-400 mb-4" />
                      <p className="text-base font-medium text-gray-900 mb-2">
                        Click to upload
                      </p>
                      <p className="text-sm text-gray-600 mb-4">
                        JPG or PNG (Max 5MB)
                      </p>
                      <div className="inline-flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors">
                        Upload Image
                      </div>
                    </div>
                  </label>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative rounded-lg overflow-hidden border border-gray-300">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-64 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedImage(null);
                        setPreviewUrl("");
                      }}
                      className="absolute top-4 right-4 bg-white text-gray-700 px-4 py-2 rounded-lg text-sm font-medium shadow-lg hover:bg-gray-100"
                    >
                      Change Image
                    </button>
                  </div>
                </div>
              )}

              <p className="mt-2 text-sm text-gray-500">
                Adding an appealing image will help your listing attract more
                buyers. We recommend a well-lit photo that clearly shows your
                food.
              </p>
            </div>

            <div className="md:col-span-2 mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => navigate("/my-listings")}
                  className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-orange-500 text-white px-8 py-3 rounded-lg font-medium hover:bg-orange-600 disabled:bg-orange-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader size={20} className="animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Listing"
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Listing Tips */}
        <div className="bg-orange-50 rounded-2xl p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Tips for a Great Listing
          </h3>

          <ul className="space-y-3">
            <li className="flex items-start gap-2">
              <span className="text-orange-500 font-bold mt-0.5">•</span>
              <span className="text-gray-700 text-sm">
                <strong>Be detailed</strong> - Include ingredients, portion
                size, and any allergens
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-500 font-bold mt-0.5">•</span>
              <span className="text-gray-700 text-sm">
                <strong>Add a great photo</strong> - Clear, well-lit images help
                your food stand out
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-500 font-bold mt-0.5">•</span>
              <span className="text-gray-700 text-sm">
                <strong>Set reasonable pickup times</strong> - Make sure you'll
                be available during the window you specify
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-500 font-bold mt-0.5">•</span>
              <span className="text-gray-700 text-sm">
                <strong>Price appropriately</strong> - Consider your costs and
                compare with similar listings
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CreateListingPage;
