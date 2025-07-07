import {useState} from 'react';
import {validateRecipe} from '../utils/validation';

export const useRecipeForm = () => {
    const [recipe, setRecipe] = useState({
        title: '',
        description: '',
        time: 15,
        categories: [],
        allergens: [],
        dietary: [],
        ingredients: [{amount: '', ingredient: ''}],
        instructions: [''],
        image: null
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const updateField = (field, value) => {
        setRecipe(prev => ({...prev, [field]: value}));
        if (errors[field]) {
            setErrors(prev => ({...prev, [field]: null}));
        }
    };
    const addIngredient = () => {
        setRecipe(prev => ({
            ...prev,
            ingredients: [...prev.ingredients, {amount: '', ingredient: ''}]
        }));
    };
    const removeIngredient = (index) => {
        setRecipe(prev => ({
            ...prev,
            ingredients: prev.ingredients.filter((_, i) => i !== index)
        }));
    };
    const updateIngredient = (index, field, value) => {
        setRecipe(prev => ({
            ...prev,
            ingredients: prev.ingredients.map((item, i) =>
                i === index ? {...item, [field]: value} : item
            )
        }));
    };
    const addInstruction = () => {
        setRecipe(prev => ({
            ...prev,
            instructions: [...prev.instructions, '']
        }));
    };
    const removeInstruction = (index) => {
        setRecipe(prev => ({
            ...prev,
            instructions: prev.instructions.filter((_, i) => i !== index)
        }));
    };
    const updateInstruction = (index, value) => {
        setRecipe(prev => ({
            ...prev,
            instructions: prev.instructions.map((instruction, i) =>
                i === index ? value : instruction
            )
        }));
    };
    const toggleCategory = (categoryId) => {
        setRecipe(prev => ({
            ...prev,
            categories: prev.categories.includes(categoryId)
                ? prev.categories.filter(id => id !== categoryId)
                : [...prev.categories, categoryId]
        }));
    };
    const toggleAllergen = (allergenId) => {
        setRecipe(prev => ({
            ...prev,
            allergens: prev.allergens.includes(allergenId)
                ? prev.allergens.filter(id => id !== allergenId)
                : [...prev.allergens, allergenId]
        }));
    };
    const toggleDietary = (dietaryId) => {
        setRecipe(prev => ({
            ...prev,
            dietary: prev.dietary.includes(dietaryId)
                ? prev.dietary.filter(id => id !== dietaryId)
                : [...prev.dietary, dietaryId]
        }));
    };
    const validateForm = () => {
        const validation = validateRecipe(recipe);
        setErrors(validation.errors);
        return validation.isValid;
    };
    const resetForm = () => {
        setRecipe({
            title: '',
            description: '',
            time: 15,
            categories: [],
            allergens: [],
            dietary: [],
            ingredients: [{amount: '', ingredient: ''}],
            instructions: [''],
            image: null
        });
        setErrors({});
    };
    return {
        recipe,
        errors,
        isLoading,
        setIsLoading,
        updateField,
        addIngredient,
        removeIngredient,
        updateIngredient,
        addInstruction,
        removeInstruction,
        updateInstruction,
        toggleCategory,
        toggleAllergen,
        toggleDietary,
        validateForm,
        resetForm
    };
};