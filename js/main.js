// * PFCバランスの計算
document.getElementById('bodyInfoInput').addEventListener('submit', function (event) {
    event.preventDefault();

    // 入力値を取得
    const sex = document.getElementById('sex').value;
    const age = parseInt(document.getElementById('age').value);
    const height = parseInt(document.getElementById('height').value);
    const weight = parseInt(document.getElementById('weight').value);
    const activityLevel = document.getElementById('activity').value;
    const goal = document.getElementById('goal').value;

    // BMRの計算
    let bmr;
    if (sex === "1") { // 女性の場合
        bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    } else { // 男性の場合
        bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    }

    // 活動レベルに基づいた総エネルギー必要量の計算
    let totalCalories;
    switch (activityLevel) {
        case "1":
            totalCalories = bmr * 1.2;
            break;
        case "2":
            totalCalories = bmr * 1.5;
            break;
        case "3":
            totalCalories = bmr * 1.75;
            break;
        default:
            totalCalories = bmr;
    }

    // 目的に応じてPFCバランスを計算（例として固定割合を使用）
    let proteinGrams, fatGrams, carbGrams;
    switch (goal) {
        case "1": // ダイエットの場合
            proteinGrams = totalCalories * 0.40 / 4;
            fatGrams = totalCalories * 0.30 / 9;
            carbGrams = totalCalories * 0.30 / 4;
            break;
        case "2": // 維持の場合
            proteinGrams = totalCalories * 0.30 / 4;
            fatGrams = totalCalories * 0.35 / 9;
            carbGrams = totalCalories * 0.35 / 4;
            break;
        case "3": // 増量の場合
            proteinGrams = totalCalories * 0.25 / 4;
            fatGrams = totalCalories * 0.20 / 9;
            carbGrams = totalCalories * 0.55 / 4;
            break;
    }

    // 結果を表示
    const pfcResultDiv = document.querySelector('.pfcResult');
    pfcResultDiv.innerHTML = `
        <p>あなたの1日あたりの目標摂取量は</p>
        <div class="pfcResultWrap">
            <div class="pfcResultItem">
                <span>タンパク質</span>
                <span>${proteinGrams.toFixed(1)} g</span>
            </div>
            <div class="pfcResultItem">
                <span>脂質</span>
                <span>${fatGrams.toFixed(1)} g</span>
            </div>
            <div class="pfcResultItem">
                <span>炭水化物</sp>
                <span>${carbGrams.toFixed(1)} g</span>
            </div>
        </div>
    `;
});

// レシピIDを格納する配列 ※グローバルスコープで宣言することで複数の関数で使える
let recipeIds = [];
let uniqueRecipeIds = [];

const apiKey = 'XXX';

// APIレスポンスを処理し、レシピを表示する関数
function fetchAndDisplayMeals(apiUrl, mealType) {
    // すべてのdayPlanの内容をクリア
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    days.forEach(day => {
        const dayPlanId = `${day}${mealType}`;
        const dayPlanElement = document.getElementById(dayPlanId);
        if (dayPlanElement) {
            dayPlanElement.innerHTML = ''; // 既存のコンテンツをクリア
        }
    });

    fetch(apiUrl)
        .then(response => response.json())
        .then(recipes => {
            // データを日ごとに分配して表示
            recipes.forEach((recipe, index) => {
                // レシピのIDを配列に追加
                recipeIds.push(...recipes.map(recipe => recipe.id));
                console.log(recipeIds);
                // レシピIDの重複を削除
                uniqueRecipeIds = [...new Set(recipeIds)];
                console.log(uniqueRecipeIds);

                const day = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'][index];
                const mealTime = mealType;

                const recipeElement = document.createElement('div');
                recipeElement.innerHTML = `
                <h3> ${recipe.title}</h3>
                <img src="${recipe.image}" alt="${recipe.title}">
                <p>Protein: ${recipe.protein}</p>
                <p>Fat: ${recipe.fat}</p>
                <p>Carbs: ${recipe.carbs}</p>
                <p>Calories: ${recipe.calories}</p>

            `;

                //    クリックして各レシピの詳細ページを表示
                recipeElement.addEventListener('click', () => {
                    // 別ウィンドウで表示する場合
                    window.open(`https://spoonacular.com/recipes/${recipe.title}-${recipe.id}`, '_blank');
                });

                document.getElementById(`${day}${mealTime}`).appendChild(recipeElement);
            });
        })
        .catch(error => console.error('Error:', error));
}

// レシピIDを使用して材料リストを取得する
async function fetchIngredients(uniqueRecipeIds) {
    const url = `https://api.spoonacular.com/recipes/${uniqueRecipeIds}/ingredientWidget.json?apiKey=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.ingredients; // 材料リストを返す
    } catch (error) {
        console.error('Error fetching ingredients:', error);
        return [];
    }
}


// * PFCバランスから献立を作成
document.getElementById('nutrientsForm').addEventListener('submit', function (event) {
    event.preventDefault(); // フォームのデフォルトの送信を防ぐ

    // テスト時 90 51 129

    //* 入力値を取得
    const minProtein = document.getElementById('minProtein').value;
    const maxProtein = document.getElementById('maxProtein').value;
    const minFat = document.getElementById('minFat').value;
    const maxFat = document.getElementById('maxFat').value;
    const minCarbs = document.getElementById('minCarbs').value;
    const maxCarbs = document.getElementById('maxCarbs').value;
    // const minCalories = document.getElementById('minCalories').value;
    // const maxCalories = document.getElementById('maxCalories').value;

    //* 1日分の数値を朝昼晩用に分割
    //? リクエストが1ptで結果表示が0.1ptなので費用を安くするためにもっと適した設計ができそう→朝晩をLight,昼をHeavyにするとか。結果を使いまわしするとか。
    //? テスト段階でいっぱいAPI使ってしまうと無料プランの上限にきてしまう。何かいい策はないか？ CSSのためならダミーでレスポンスを飛ばすとか？
    // →ダミーデータ作るのも手。一回のレスポンスでたくさん検証できるように事前に準備しておく。
    // 分割のための関数
    const calculatePortions = (value) => {
        return {
            breakfast: value * 0.3,
            lunch: value * 0.4,
            dinner: value * 0.3
        };
    };
    // 各栄養素を分割
    const minProteinPortions = calculatePortions(minProtein);
    const maxProteinPortions = calculatePortions(maxProtein);
    const minFatPortions = calculatePortions(minFat);
    const maxFatPortions = calculatePortions(maxFat);
    const minCarbsPortions = calculatePortions(minCarbs);
    const maxCarbsPortions = calculatePortions(maxCarbs);
    // const minCaloriesPortions = calculatePortions(minCalories);
    // const maxCaloriesPortions = calculatePortions(maxCalories);

    //* APIリクエストの作成
    const apiUrlBreakfast = `https://api.spoonacular.com/recipes/findByNutrients?apiKey=${apiKey}&minProtein=${minProteinPortions.breakfast}&maxProtein=${maxProteinPortions.breakfast}&minFat=${minFatPortions.breakfast}&maxFat=${maxFatPortions.breakfast}&minCarbs=${minCarbsPortions.breakfast}&maxCarbs=${maxCarbsPortions.breakfast}&number=7`;
    const apiUrlLunch = `https://api.spoonacular.com/recipes/findByNutrients?apiKey=${apiKey}&minProtein=${minProteinPortions.lunch}&maxProtein=${maxProteinPortions.lunch}&minFat=${minFatPortions.lunch}&maxFat=${maxFatPortions.lunch}&minCarbs=${minCarbsPortions.lunch}&maxCarbs=${maxCarbsPortions.lunch}&number=7`;
    const apiUrlDinner = `https://api.spoonacular.com/recipes/findByNutrients?apiKey=${apiKey}&minProtein=${minProteinPortions.dinner}&maxProtein=${maxProteinPortions.dinner}&minFat=${minFatPortions.dinner}&maxFat=${maxFatPortions.dinner}&minCarbs=${minCarbsPortions.dinner}&maxCarbs=${maxCarbsPortions.dinner}&number=7`;
    // URLの確認
    console.log(apiUrlBreakfast);
    console.log(apiUrlLunch);
    console.log(apiUrlDinner);

    //*結果を1週間分の献立として表示 
    // 朝食、昼食、夕食用のAPIリクエストを実行
    fetchAndDisplayMeals(apiUrlBreakfast, 'Breakfast');
    fetchAndDisplayMeals(apiUrlLunch, 'Lunch');
    fetchAndDisplayMeals(apiUrlDinner, 'Dinner');



    // *買い物リストを作成する
    document.getElementById('shoppingListCreateButton').addEventListener('click', async function () {
        let ingredientsSum = {};

        // 材料リストの集計
        for (let i = 0; i < uniqueRecipeIds.length; i++) {
            const ingredients = await fetchIngredients(uniqueRecipeIds[i]);

            ingredients.forEach(ingredient => {
                // 材料の合計計算
                const ingredientName = ingredient.name;
                const amount = ingredient.amount.metric.value;

                if (ingredientsSum[ingredientName]) {
                    ingredientsSum[ingredientName] += amount;
                } else {
                    ingredientsSum[ingredientName] = amount;
                }
            });
        }

        //======= 表示の処理
        // モーダルを開く関数
        function openModal() {
            document.getElementById("modal").style.display = "block";
        }

        // モーダルを閉じる関数
        function closeModal() {
            document.getElementById("modal").style.display = "none";
        }
        // 買い物リストをHTMLに変換
        let ingredientsHtml = '';
        for (let ingredient in ingredientsSum) {
            ingredientsHtml += `<li>${ingredient}: ${ingredientsSum[ingredient].toFixed(2)} g</li>`;
        }

        // モーダルウィンドウに表示
        const shoppingListElement = document.getElementById("shopping-list");
        shoppingListElement.innerHTML = `<ul>${ingredientsHtml}</ul>`;

        // モーダルを開く
        openModal();
    });

    // 閉じるボタンにイベントリスナーを設定
    document.querySelector(".close-button").addEventListener("click", closeModal);


});

//* ダミーを使って検証するとき用 
// 検証用のダミーデータ
const dummyRecipesBreakfast = [
    {
        "id": 632810,
        "title": "Asian Chicken",
        "image": "https://spoonacular.com/recipeImages/632810-312x231.jpg",
        "imageType": "jpg",
        "calories": 320,
        "protein": "26g",
        "fat": "7g",
        "carbs": "37g"
    },
    {
        "id": 633376,
        "title": "Bagels",
        "image": "https://spoonacular.com/recipeImages/633376-312x231.jpg",
        "imageType": "jpg",
        "calories": 295,
        "protein": "29g",
        "fat": "4g",
        "carbs": "36g"
    },
    {
        "id": 633508,
        "title": "Baked Cheese Manicotti",
        "image": "https://spoonacular.com/recipeImages/633508-312x231.jpg",
        "imageType": "jpg",
        "calories": 441,
        "protein": "28g",
        "fat": "12g",
        "carbs": "46g"
    },
    {
        "id": 634165,
        "title": "Banana Prawn Rolls",
        "image": "https://spoonacular.com/recipeImages/634165-312x231.jpg",
        "imageType": "jpg",
        "calories": 342,
        "protein": "24g",
        "fat": "5g",
        "carbs": "51g"
    },
    {
        "id": 638199,
        "title": "Chicken Mulligatawny Soup",
        "image": "https://spoonacular.com/recipeImages/638199-312x231.jpg",
        "imageType": "jpg",
        "calories": 368,
        "protein": "27g",
        "fat": "10g",
        "carbs": "38g"
    },
    {
        "id": 652250,
        "title": "Molasses and Cayenne Pork Loin",
        "image": "https://spoonacular.com/recipeImages/652250-312x231.jpg",
        "imageType": "jpg",
        "calories": 332,
        "protein": "27g",
        "fat": "5g",
        "carbs": "44g"
    },
    {
        "id": 663151,
        "title": "Thai Shrimp",
        "image": "https://spoonacular.com/recipeImages/663151-312x231.jpg",
        "imageType": "jpg",
        "calories": 355,
        "protein": "27g",
        "fat": "7g",
        "carbs": "42g"
    }
];
const dummyRecipesLunch = [
    {
        "id": 632812,
        "title": "Asian Chicken and Broccoli With Chili Garlic Sauce",
        "image": "https://spoonacular.com/recipeImages/632812-312x231.jpg",
        "imageType": "jpg",
        "calories": 546,
        "protein": "33g",
        "fat": "9g",
        "carbs": "77g"
    },
    {
        "id": 636360,
        "title": "Brussels Sprout Carbonara with Fettuccini",
        "image": "https://spoonacular.com/recipeImages/636360-312x231.jpg",
        "imageType": "jpg",
        "calories": 549,
        "protein": "38g",
        "fat": "17g",
        "carbs": "56g"
    },
    {
        "id": 637897,
        "title": "Chicken and Chickpea Chili",
        "image": "https://spoonacular.com/recipeImages/637897-312x231.jpg",
        "imageType": "jpg",
        "calories": 610,
        "protein": "37g",
        "fat": "18g",
        "carbs": "64g"
    },
    {
        "id": 642594,
        "title": "Farfalle with Shrimps, Tomatoes Basil Sauce",
        "image": "https://spoonacular.com/recipeImages/642594-312x231.jpg",
        "imageType": "jpg",
        "calories": 570,
        "protein": "38g",
        "fat": "8g",
        "carbs": "81g"
    },
    {
        "id": 642929,
        "title": "Fish Congee",
        "image": "https://spoonacular.com/recipeImages/642929-312x231.jpg",
        "imageType": "jpg",
        "calories": 441,
        "protein": "36g",
        "fat": "5g",
        "carbs": "57g"
    },
    {
        "id": 659638,
        "title": "Seafood Gumbo",
        "image": "https://spoonacular.com/recipeImages/659638-312x231.jpg",
        "imageType": "jpg",
        "calories": 376,
        "protein": "35g",
        "fat": "5g",
        "carbs": "43g"
    },
    {
        "id": 982365,
        "title": "Instant Pot Hawaiian Chicken",
        "image": "https://spoonacular.com/recipeImages/982365-312x231.jpg",
        "imageType": "jpg",
        "calories": 473,
        "protein": "38g",
        "fat": "5g",
        "carbs": "65g"
    }
];
const dummyRecipesDinner = [
    {
        "id": 632810,
        "title": "Asian Chicken",
        "image": "https://spoonacular.com/recipeImages/632810-312x231.jpg",
        "imageType": "jpg",
        "calories": 320,
        "protein": "26g",
        "fat": "7g",
        "carbs": "37g"
    },
    {
        "id": 633376,
        "title": "Bagels",
        "image": "https://spoonacular.com/recipeImages/633376-312x231.jpg",
        "imageType": "jpg",
        "calories": 295,
        "protein": "29g",
        "fat": "4g",
        "carbs": "36g"
    },
    {
        "id": 633508,
        "title": "Baked Cheese Manicotti",
        "image": "https://spoonacular.com/recipeImages/633508-312x231.jpg",
        "imageType": "jpg",
        "calories": 441,
        "protein": "28g",
        "fat": "12g",
        "carbs": "46g"
    },
    {
        "id": 634165,
        "title": "Banana Prawn Rolls",
        "image": "https://spoonacular.com/recipeImages/634165-312x231.jpg",
        "imageType": "jpg",
        "calories": 342,
        "protein": "24g",
        "fat": "5g",
        "carbs": "51g"
    },
    {
        "id": 638199,
        "title": "Chicken Mulligatawny Soup",
        "image": "https://spoonacular.com/recipeImages/638199-312x231.jpg",
        "imageType": "jpg",
        "calories": 368,
        "protein": "27g",
        "fat": "10g",
        "carbs": "38g"
    },
    {
        "id": 652250,
        "title": "Molasses and Cayenne Pork Loin",
        "image": "https://spoonacular.com/recipeImages/652250-312x231.jpg",
        "imageType": "jpg",
        "calories": 332,
        "protein": "27g",
        "fat": "5g",
        "carbs": "44g"
    },
    {
        "id": 663151,
        "title": "Thai Shrimp",
        "image": "https://spoonacular.com/recipeImages/663151-312x231.jpg",
        "imageType": "jpg",
        "calories": 355,
        "protein": "27g",
        "fat": "7g",
        "carbs": "42g"
    }
]
// ダミーデータを使って表示
// function displayDummyMeals(dummyRecipes, mealType) {
//     // すべてのdayPlanの内容をクリア
//     const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
//     days.forEach(day => {
//         const dayPlanId = `${day}${mealType}`;
//         const dayPlanElement = document.getElementById(dayPlanId);
//         if (dayPlanElement) {
//             dayPlanElement.innerHTML = ''; // 既存のコンテンツをクリア
//         }
//     });

//     // ダミーデータを表示
//     dummyRecipes.forEach((recipe, index) => {
//         const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'][index];
//         const mealTime = mealType;
//         const recipeElement = document.createElement('div');
//         recipeElement.innerHTML = `
//             <h3> ${recipe.title}</h3>
//             <img src="${recipe.image}" alt="${recipe.title}">
//             <p>Protein: ${recipe.protein}</p>
//             <p>Fat: ${recipe.fat}</p>
//             <p>Carbs: ${recipe.carbs}</p>
//             <p>Calories: ${recipe.calories}</p>
//         `;

//         // クリックして各レシピの詳細ページを表示
//         recipeElement.addEventListener('click', () => {
//             // 別ウィンドウで表示する場合
//             window.open(`https://spoonacular.com/recipes/${recipe.title}-${recipe.id}`, '_blank');
//         });

//         document.getElementById(`${days}${mealTime}`).appendChild(recipeElement);
//     });
// }
// 表示
// displayDummyMeals(dummyRecipesBreakfast, 'Breakfast');
// displayDummyMeals(dummyRecipesLunch, 'Lunch');
// displayDummyMeals(dummyRecipesDinner, 'Dinner');

