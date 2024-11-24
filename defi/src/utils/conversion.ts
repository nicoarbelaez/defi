const BASE_GRAMS = 100; // Base estándar para cálculos (puede ajustarse según necesidades).

/**
 * Obtiene los carbohidratos de un alimento.
 * @param grams - La cantidad en gramos.
 * @param ingredient - El objeto ingrediente.
 * @returns La cantidad de carbohidratos.
 */
function getCarbs(grams: number, ingredient: Micronutrients): number {
  return calculateNutrient(grams, ingredient.carb);
}

/**
 * Obtiene las proteínas de un alimento.
 * @param grams - La cantidad en gramos.
 * @param ingredient - El objeto ingrediente.
 * @returns La cantidad de proteínas.
 */
function getProteins(grams: number, ingredient: Micronutrients): number {
  return calculateNutrient(grams, ingredient.protein);
}

/**
 * Obtiene las grasas de un alimento.
 * @param grams - La cantidad en gramos.
 * @param ingredient - El objeto ingrediente.
 * @returns La cantidad de grasas.
 */
function getFats(grams: number, ingredient: Micronutrients): number {
  return calculateNutrient(grams, ingredient.fat);
}

/**
 * Obtiene las calorías de un alimento.
 * @param grams - La cantidad en gramos.
 * @param ingredient - El objeto ingrediente.
 * @returns La cantidad de calorías.
 */
function getCalories(grams: number, ingredient: Micronutrients): number {
  return calculateNutrient(grams, ingredient.kcal);
}

/**
 * Calcula un nutriente basado en una cantidad de gramos y el valor del nutriente.
 * @param grams - La cantidad en gramos.
 * @param nutrientValue - El valor del nutriente por 100 gramos.
 * @returns El valor proporcional del nutriente.
 */
function calculateNutrient(grams: number, nutrientValue: number): number {
  return (grams * nutrientValue) / BASE_GRAMS;
}

/**
 * Obtiene la unidad casera proporcional de un alimento.
 * @param grams - La cantidad en gramos.
 * @param ingredient - El objeto ingrediente.
 * @returns La unidad casera proporcional o una cadena vacía si no está definida.
 */
function getHomeUnit(grams: number, ingredient: Micronutrients): string {
  if (!ingredient.homeUnit) return "";

  const { value, unit } = ingredient.homeUnit;
  const proportionalValue = (grams * value) / BASE_GRAMS;
  return `${proportionalValue.toFixed(2)} ${unit}`;
}

/**
 * Encuentra un ítem por su código y nombre de alimento en el mapa de datos.
 * @param code - El código del alimento.
 * @param food - El nombre del alimento.
 * @returns El ítem encontrado.
 * @throws Si no se encuentra el ítem.
 */
function findItemByCodeAndFood(code: string, food: string): Micronutrients {
  const dataFood: ResponseDoGet = DocumentPropertiesService.getProperty("db");
  const item = dataFood.items.find((item) => item.code === code);

  if (!item) {
    throw new Error(`Item with code "${code}" not found.`);
  }

  const foodItem = item.food.find((micro) => micro.nameFood === food);

  if (!foodItem) {
    throw new Error(`Food with name "${food}" not found for code "${code}".`);
  }

  return foodItem;
}
