import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MdAdd, 
  MdEdit, 
  MdDelete, 
  MdFastfood, 
  MdRestaurantMenu, 
  MdClose, 
  MdImage, 
  MdAttachMoney 
} from 'react-icons/md';

export default function MenuManagement() {
  const [activeTab, setActiveTab] = useState('meals');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'meal' or 'menu'
  const [meals, setMeals] = useState([]);
  const [menus, setMenus] = useState([]);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
    ingredients: '',
    allergens: '',
    menuItems: []
  });

  // Mock data for initial state
  useEffect(() => {
    // Sample meals data
    setMeals([
      {
        id: '1',
        name: 'Classic Cheeseburger',
        description: 'Juicy beef patty with cheddar cheese, lettuce, and tomato',
        price: 8.99,
        category: 'Burger',
        image: '/hero1.png',
        ingredients: 'Beef, cheese, lettuce, tomato, bun',
        allergens: 'Gluten, dairy'
      },
      {
        id: '2',
        name: 'Veggie Supreme',
        description: 'Plant-based patty with avocado and sprouts',
        price: 9.99,
        category: 'Burger',
        image: '/hero1.png',
        ingredients: 'Plant protein, avocado, sprouts, bun',
        allergens: 'Gluten'
      },
      {
        id: '3',
        name: 'Crispy Chicken Sandwich',
        description: 'Crispy chicken with special sauce',
        price: 7.99,
        category: 'Sandwich',
        image: '/hero1.png',
        ingredients: 'Chicken breast, lettuce, mayo, bun',
        allergens: 'Gluten, dairy, egg'
      }
    ]);

    // Sample menus data
    setMenus([
      {
        id: '1',
        name: 'Summer Special',
        description: 'Limited time summer offerings',
        image: '/hero1.png',
        menuItems: ['1', '3']
      },
      {
        id: '2',
        name: 'Value Menu',
        description: 'Great food at affordable prices',
        image: '/hero1.png',
        menuItems: ['1', '2']
      }
    ]);
  }, []);

  const handleAddNew = (type) => {
    setModalType(type);
    setFormData({
      id: '',
      name: '',
      description: '',
      price: type === 'meal' ? '0.00' : '',
      category: '',
      image: '',
      ingredients: '',
      allergens: '',
      menuItems: []
    });
    setShowModal(true);
  };

  const handleEdit = (item, type) => {
    setModalType(type);
    setFormData({
      ...item,
      price: type === 'meal' ? item.price.toString() : ''
    });
    setShowModal(true);
  };

  const handleDelete = (id, type) => {
    if (type === 'meal') {
      setMeals(meals.filter(meal => meal.id !== id));
      
      // Also remove this meal from any menus that include it
      const updatedMenus = menus.map(menu => ({
        ...menu,
        menuItems: menu.menuItems.filter(itemId => itemId !== id)
      }));
      setMenus(updatedMenus);
    } else {
      setMenus(menus.filter(menu => menu.id !== id));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMenuItemToggle = (mealId) => {
    const currentItems = [...formData.menuItems];
    if (currentItems.includes(mealId)) {
      setFormData({
        ...formData,
        menuItems: currentItems.filter(id => id !== mealId)
      });
    } else {
      setFormData({
        ...formData,
        menuItems: [...currentItems, mealId]
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (modalType === 'meal') {
      const newMeal = {
        ...formData,
        id: formData.id || Date.now().toString(),
        price: parseFloat(formData.price)
      };
      
      if (formData.id) {
        // Edit existing
        setMeals(meals.map(meal => meal.id === formData.id ? newMeal : meal));
      } else {
        // Add new
        setMeals([...meals, newMeal]);
      }
    } else {
      const newMenu = {
        ...formData,
        id: formData.id || Date.now().toString()
      };
      
      if (formData.id) {
        // Edit existing
        setMenus(menus.map(menu => menu.id === formData.id ? newMenu : menu));
      } else {
        // Add new
        setMenus([...menus, newMenu]);
      }
    }
    
    setShowModal(false);
  };

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
                onClick={() => handleAddNew('meal')}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-1"
              >
                <MdAdd className="text-xl" /> New Meal
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleAddNew('menu')}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-1"
              >
                <MdAdd className="text-xl" /> New Menu
              </motion.button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => setActiveTab('meals')}
              className={`py-3 px-6 font-medium flex items-center gap-2 ${
                activeTab === 'meals'
                  ? 'text-orange-500 border-b-2 border-orange-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <MdFastfood /> Meals
            </button>
            <button
              onClick={() => setActiveTab('menus')}
              className={`py-3 px-6 font-medium flex items-center gap-2 ${
                activeTab === 'menus'
                  ? 'text-orange-500 border-b-2 border-orange-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <MdRestaurantMenu /> Menus
            </button>
          </div>

          {/* Meals Tab Content */}
          {activeTab === 'meals' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {meals.map((meal) => (
                <motion.div
                  key={meal.id}
                  whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
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
                        <h3 className="font-bold text-xl text-gray-800">{meal.name}</h3>
                        <span className="block text-green-600 font-medium">${meal.price.toFixed(2)}</span>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEdit(meal, 'meal')}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-full"
                        >
                          <MdEdit />
                        </button>
                        <button 
                          onClick={() => handleDelete(meal.id, 'meal')}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                        >
                          <MdDelete />
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mt-2">{meal.description}</p>
                    <div className="mt-3">
                      <span className="inline-block bg-gray-100 rounded-full px-3 py-1 text-sm font-medium text-gray-700">
                        {meal.category}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Menus Tab Content */}
          {activeTab === 'menus' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {menus.map((menu) => (
                <motion.div
                  key={menu.id}
                  whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
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
                        <h3 className="font-bold text-xl text-gray-800">{menu.name}</h3>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEdit(menu, 'menu')}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-full"
                        >
                          <MdEdit />
                        </button>
                        <button 
                          onClick={() => handleDelete(menu.id, 'menu')}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                        >
                          <MdDelete />
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mt-2">{menu.description}</p>
                    
                    <div className="mt-4">
                      <h4 className="font-medium text-gray-700 mb-2">Items in this menu:</h4>
                      <ul className="space-y-1">
                        {menu.menuItems.map(itemId => {
                          const meal = meals.find(m => m.id === itemId);
                          return meal ? (
                            <li key={itemId} className="text-sm flex justify-between">
                              <span>{meal.name}</span>
                              <span className="text-green-600">${meal.price.toFixed(2)}</span>
                            </li>
                          ) : null;
                        })}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              ))}
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
                      {formData.id ? 'Edit' : 'Add New'} {modalType === 'meal' ? 'Meal' : 'Menu'}
                    </h2>
                    <button 
                      onClick={() => setShowModal(false)}
                      className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"
                    >
                      <MdClose />
                    </button>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="p-5 space-y-6">
                    {/* Common fields for both meal and menu */}
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
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

                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
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
                      <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
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
                    {modalType === 'meal' && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
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
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
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
                          <label htmlFor="ingredients" className="block text-sm font-medium text-gray-700 mb-1">
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
                          <label htmlFor="allergens" className="block text-sm font-medium text-gray-700 mb-1">
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
                    {modalType === 'menu' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Select Items for this Menu
                        </label>
                        <div className="border border-gray-300 rounded-lg p-3 max-h-60 overflow-y-auto">
                          {meals.length > 0 ? (
                            meals.map((meal) => (
                              <div key={meal.id} className="flex items-center py-2 border-b border-gray-100 last:border-0">
                                <input
                                  type="checkbox"
                                  id={`meal-${meal.id}`}
                                  checked={formData.menuItems.includes(meal.id)}
                                  onChange={() => handleMenuItemToggle(meal.id)}
                                  className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                                />
                                <label htmlFor={`meal-${meal.id}`} className="ml-2 block">
                                  <span className="text-gray-800 font-medium">{meal.name}</span>
                                  <span className="text-gray-500 text-sm ml-2">${meal.price.toFixed(2)}</span>
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
                      >
                        {formData.id ? 'Update' : 'Save'}
                      </button>
                    </div>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}