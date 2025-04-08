import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MdAdd,
  MdEdit,
  MdDelete,
  MdFastfood,
  MdRestaurantMenu,
  MdClose,
  MdImage,
  MdAttachMoney,
  MdErrorOutline,
  MdWarning,
} from "react-icons/md";
import { toast } from "react-hot-toast";
import {
  useGetMealsQuery,
  useAddMealMutation,
  useUpdateMealMutation,
  useDeleteMealMutation,
} from "../../Redux/slices/mealSlice";
import {
  useGetMenusQuery,
  useAddMenuMutation,
  useUpdateMenuMutation,
  useDeleteMenuMutation,
} from "../../Redux/slices/menuSlice";

export default function MenuManagement() {
  const [activeTab, setActiveTab] = useState("meals");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(""); // 'meal' or 'menu'
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    description: "",
    price: "",
    category: "",
    image: "",
    ingredients: "",
    allergens: "",
    menuItems: [],
  });
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    show: false,
    id: null,
    type: null,
    name: "",
  });

  // Get meals from API
  const {
    data: mealsData,
    isLoading: isMealsLoading,
    isError: isMealsError,
    error: mealsError,
  } = useGetMealsQuery();
  const meals = mealsData || [];

  // Get menus from API
  const {
    data: menusData,
    isLoading: isMenusLoading,
    isError: isMenusError,
    error: menusError,
  } = useGetMenusQuery();
  const menus = menusData || [];

  // Mutation hooks for meals
  const [addMeal, { isLoading: isAddingMeal }] = useAddMealMutation();
  const [updateMeal, { isLoading: isUpdatingMeal }] = useUpdateMealMutation();
  const [deleteMeal, { isLoading: isDeletingMeal }] = useDeleteMealMutation();

  // Menu mutations
  const [addMenu, { isLoading: isAddingMenu }] = useAddMenuMutation();
  const [updateMenu, { isLoading: isUpdatingMenu }] = useUpdateMenuMutation();
  const [deleteMenu, { isLoading: isDeletingMenu }] = useDeleteMenuMutation();

  const handleAddNew = (type) => {
    setModalType(type);
    setFormData({
      id: "",
      name: "",
      description: "",
      price: type === "meal" ? "0.00" : "",
      category: "",
      image: "/hero1.png", // Default image
      ingredients: "",
      allergens: "",
      menuItems: [],
    });
    setShowModal(true);
  };

  const handleEdit = (item, type) => {
    setModalType(type);
    setFormData({
      ...item,
      price: type === "meal" ? item.price.toString() : "",
      id: item._id || item.id, // Handle backend _id or local id
      menuItems: item.menuItems || [], // Ensure menuItems is always an array
    });
    setShowModal(true);
  };

  const handleDeleteClick = (item, type) => {
    setDeleteConfirmation({
      show: true,
      id: item._id || item.id,
      type: type,
      name: item.name,
    });
  };

  // Actual delete function that will be called after confirmation
  const handleDelete = async () => {
    try {
      const { id, type } = deleteConfirmation;

      if (type === "meal") {
        // Delete meal from backend
        await deleteMeal(id).unwrap();
        toast.success("Meal deleted successfully");
      } else {
        // Delete menu from backend
        await deleteMenu(id).unwrap();
        toast.success("Menu deleted successfully");
      }

      // Close the confirmation dialog
      setDeleteConfirmation({ show: false, id: null, type: null, name: "" });
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error.data?.error || "Failed to delete item");
      // Close the confirmation dialog even on error
      setDeleteConfirmation({ show: false, id: null, type: null, name: "" });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMenuItemToggle = (mealId) => {
    const currentItems = [...formData.menuItems];
    if (currentItems.includes(mealId)) {
      setFormData({
        ...formData,
        menuItems: currentItems.filter((id) => id !== mealId),
      });
    } else {
      setFormData({
        ...formData,
        menuItems: [...currentItems, mealId],
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (modalType === "meal") {
        const mealData = {
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          category: formData.category,
          image: formData.image,
          ingredients: formData.ingredients,
          allergens: formData.allergens,
        };

        if (formData.id) {
          // Update existing meal
          await updateMeal({
            id: formData.id,
            ...mealData,
          }).unwrap();
          toast.success("Meal updated successfully");
        } else {
          // Add new meal
          await addMeal(mealData).unwrap();
          toast.success("Meal added successfully");
        }
      } else {
        // Handle menu operations using Redux
        const menuData = {
          name: formData.name,
          description: formData.description,
          image: formData.image,
          menuItems: formData.menuItems,
        };

        if (formData.id) {
          // Update existing menu
          await updateMenu({
            id: formData.id,
            ...menuData,
          }).unwrap();
          toast.success("Menu updated successfully");
        } else {
          // Add new menu
          await addMenu(menuData).unwrap();
          toast.success("Menu created successfully");
        }
      }

      setShowModal(false);
    } catch (error) {
      console.error("Submit error:", error);
      toast.error(error.data?.error || "Failed to save item");
    }
  };

  // Show loading state for meals and menus
  if (isMealsLoading || isMenusLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // Show error state for meals
  if (isMealsError) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="bg-white p-6 rounded-xl shadow-md max-w-md w-full text-center">
          <MdErrorOutline className="text-red-500 text-5xl mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Failed to load meals
          </h2>
          <p className="text-gray-600 mb-4">
            {mealsError?.data?.error ||
              "Please check your connection and try again"}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show error state for menus
  if (isMenusError) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="bg-white p-6 rounded-xl shadow-md max-w-md w-full text-center">
          <MdErrorOutline className="text-red-500 text-5xl mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Failed to load menus
          </h2>
          <p className="text-gray-600 mb-4">
            {menusError?.data?.error ||
              "Please check your connection and try again"}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleAddNew("meal")}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-1"
                disabled={isAddingMeal}
              >
                <MdAdd className="text-xl" /> New Meal
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleAddNew("menu")}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-1"
                disabled={isAddingMenu}
              >
                <MdAdd className="text-xl" /> New Menu
              </motion.button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => setActiveTab("meals")}
              className={`py-3 px-6 font-medium flex items-center gap-2 ${
                activeTab === "meals"
                  ? "text-orange-500 border-b-2 border-orange-500"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <MdFastfood /> Meals
            </button>
            <button
              onClick={() => setActiveTab("menus")}
              className={`py-3 px-6 font-medium flex items-center gap-2 ${
                activeTab === "menus"
                  ? "text-orange-500 border-b-2 border-orange-500"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <MdRestaurantMenu /> Menus
            </button>
          </div>

          {/* Meals Tab Content */}
          {activeTab === "meals" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {meals.length > 0 ? (
                meals.map((meal) => (
                  <motion.div
                    key={meal._id}
                    whileHover={{
                      y: -5,
                      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                    }}
                    className="bg-white rounded-xl overflow-hidden shadow-md transition-all duration-300"
                  >
                    <img
                      src={meal.image}
                      alt={meal.name}
                      className="w-full h-44 object-cover"
                    />
                    <div className="p-5">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-xl text-gray-800">
                            {meal.name}
                          </h3>
                          <span className="block text-green-600 font-medium">
                            ${parseFloat(meal.price).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(meal, "meal")}
                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-full"
                            disabled={isUpdatingMeal}
                          >
                            <MdEdit />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(meal, "meal")}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                            disabled={isDeletingMeal}
                          >
                            <MdDelete />
                          </button>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm mt-2">
                        {meal.description}
                      </p>
                      <div className="mt-3">
                        <span className="inline-block bg-gray-100 rounded-full px-3 py-1 text-sm font-medium text-gray-700">
                          {meal.category}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-3 flex flex-col items-center justify-center py-12">
                  <MdFastfood className="text-gray-300 text-6xl mb-4" />
                  <h3 className="text-xl font-medium text-gray-700">
                    No meals found
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Start by creating your first meal item
                  </p>
                  <button
                    onClick={() => handleAddNew("meal")}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-1"
                  >
                    <MdAdd className="text-xl" /> Add First Meal
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* Menus Tab Content */}
          {activeTab === "menus" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {menus.length > 0 ? (
                menus.map((menu) => (
                  <motion.div
                    key={menu._id}
                    whileHover={{
                      y: -5,
                      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                    }}
                    className="bg-white rounded-xl overflow-hidden shadow-md transition-all duration-300"
                  >
                    <img
                      src={menu.image}
                      alt={menu.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-5">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-xl text-gray-800">
                            {menu.name}
                          </h3>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(menu, "menu")}
                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-full"
                            disabled={isUpdatingMenu}
                          >
                            <MdEdit />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(menu, "menu")}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                            disabled={isDeletingMenu}
                          >
                            <MdDelete />
                          </button>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm mt-2">
                        {menu.description}
                      </p>

                      <div className="mt-4">
                        <h4 className="font-medium text-gray-700 mb-2">
                          Items in this menu:
                        </h4>
                        <ul className="space-y-1">
                          {menu.menuItems && menu.menuItems.length > 0 ? (
                            menu.menuItems.map((itemId) => {
                              const meal = meals.find(
                                (m) => m._id === itemId || m.id === itemId
                              );
                              return meal ? (
                                <li
                                  key={itemId}
                                  className="text-sm flex justify-between"
                                >
                                  <span>{meal.name}</span>
                                  <span className="text-green-600">
                                    ${parseFloat(meal.price).toFixed(2)}
                                  </span>
                                </li>
                              ) : null;
                            })
                          ) : (
                            <li className="text-sm text-gray-500">
                              No items in this menu
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-2 flex flex-col items-center justify-center py-12">
                  <MdRestaurantMenu className="text-gray-300 text-6xl mb-4" />
                  <h3 className="text-xl font-medium text-gray-700">
                    No menus found
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Start by creating your first menu
                  </p>
                  <button
                    onClick={() => handleAddNew("menu")}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-1"
                  >
                    <MdAdd className="text-xl" /> Add First Menu
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* Modal for Adding/Editing */}
          <AnimatePresence>
            {showModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
                >
                  <div className="sticky top-0 bg-white border-b border-gray-200 p-5 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">
                      {formData.id ? "Edit" : "Add New"}{" "}
                      {modalType === "meal" ? "Meal" : "Menu"}
                    </h2>
                    <button
                      onClick={() => setShowModal(false)}
                      className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"
                    >
                      <MdClose />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="p-5 space-y-6">
                    {/* Form content remains the same */}
                    {/* Common fields for both meal and menu */}
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                        placeholder={`Enter ${modalType} name`}
                        value={formData.name}
                        onChange={handleChange}
                      />
                    </div>

                    {/* Rest of the form content... */}
                    {/* ... */}

                    <div>
                      <label
                        htmlFor="description"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Description
                      </label>
                      <textarea
                        name="description"
                        id="description"
                        rows="3"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                        placeholder="Enter description"
                        value={formData.description}
                        onChange={handleChange}
                      ></textarea>
                    </div>

                    <div>
                      <label
                        htmlFor="image"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Image URL
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <MdImage className="text-gray-400" />
                        </div>
                        <input
                          type="text"
                          name="image"
                          id="image"
                          className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                          placeholder="Enter image URL or path"
                          value={formData.image}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    {/* Fields specific to meals */}
                    {modalType === "meal" && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label
                              htmlFor="price"
                              className="block text-sm font-medium text-gray-700 mb-1"
                            >
                              Price
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MdAttachMoney className="text-gray-400" />
                              </div>
                              <input
                                type="number"
                                name="price"
                                id="price"
                                step="0.01"
                                min="0"
                                required
                                className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                                placeholder="0.00"
                                value={formData.price}
                                onChange={handleChange}
                              />
                            </div>
                          </div>

                          <div>
                            <label
                              htmlFor="category"
                              className="block text-sm font-medium text-gray-700 mb-1"
                            >
                              Category
                            </label>
                            <input
                              type="text"
                              name="category"
                              id="category"
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                              placeholder="e.g., Burger, Pasta, Dessert"
                              value={formData.category}
                              onChange={handleChange}
                            />
                          </div>
                        </div>

                        <div>
                          <label
                            htmlFor="ingredients"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Ingredients
                          </label>
                          <input
                            type="text"
                            name="ingredients"
                            id="ingredients"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                            placeholder="e.g., Chicken, Rice, Vegetables"
                            value={formData.ingredients}
                            onChange={handleChange}
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="allergens"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Allergens
                          </label>
                          <input
                            type="text"
                            name="allergens"
                            id="allergens"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                            placeholder="e.g., Gluten, Dairy, Nuts"
                            value={formData.allergens}
                            onChange={handleChange}
                          />
                        </div>
                      </>
                    )}

                    {/* Menu item selection for menus */}
                    {modalType === "menu" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Select Items for this Menu
                        </label>
                        <div className="border border-gray-300 rounded-lg p-3 max-h-60 overflow-y-auto">
                          {meals.length > 0 ? (
                            meals.map((meal) => (
                              <div
                                key={meal._id}
                                className="flex items-center py-2 border-b border-gray-100 last:border-0"
                              >
                                <input
                                  type="checkbox"
                                  id={`meal-${meal._id}`}
                                  checked={formData.menuItems.includes(
                                    meal._id || meal.id
                                  )}
                                  onChange={() =>
                                    handleMenuItemToggle(meal._id || meal.id)
                                  }
                                  className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                                />
                                <label
                                  htmlFor={`meal-${meal._id}`}
                                  className="ml-2 block"
                                >
                                  <span className="text-gray-800 font-medium">
                                    {meal.name}
                                  </span>
                                  <span className="text-gray-500 text-sm ml-2">
                                    ${parseFloat(meal.price).toFixed(2)}
                                  </span>
                                </label>
                              </div>
                            ))
                          ) : (
                            <p className="text-gray-500 text-center py-4">
                              No meals available. Please add meals first.
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                      <button
                        type="button"
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                        onClick={() => setShowModal(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                        disabled={isAddingMeal || isUpdatingMeal}
                      >
                        {formData.id ? "Update" : "Save"}
                      </button>
                    </div>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Delete Confirmation Modal */}
          <AnimatePresence>
            {deleteConfirmation.show && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white rounded-xl max-w-md w-full p-6"
                >
                  <div className="text-center mb-4">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                      <MdWarning className="h-10 w-10 text-red-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">
                      Confirm Deletion
                    </h3>
                  </div>

                  <p className="text-gray-600 text-center mb-6">
                    Are you sure you want to delete "
                    <span className="font-semibold">
                      {deleteConfirmation.name}
                    </span>
                    "?
                    {deleteConfirmation.type === "meal"
                      ? " This will also remove it from any menus that include it."
                      : " This will not delete the individual meal items."}
                  </p>

                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() =>
                        setDeleteConfirmation({
                          show: false,
                          id: null,
                          type: null,
                          name: "",
                        })
                      }
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                      disabled={isDeletingMeal}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDelete}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                      disabled={isDeletingMeal}
                    >
                      {isDeletingMeal ? (
                        <div className="flex items-center">
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                          Deleting...
                        </div>
                      ) : (
                        "Delete"
                      )}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
