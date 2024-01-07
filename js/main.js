document.getElementById('nutrientsForm').addEventListener('submit', function (event) {
    event.preventDefault(); // フォームのデフォルトの送信を防ぐ


    //* 入力値を取得
    const minProtein = document.getElementById('minProtein').value;
    const maxProtein = document.getElementById('maxProtein').value;
    const minFat = document.getElementById('minFat').value;
    const maxFat = document.getElementById('maxFat').value;
    const minCarbs = document.getElementById('minCarbs').value;
    const maxCarbs = document.getElementById('maxCarbs').value;
    const minCalories = document.getElementById('minCalories').value;
    const maxCalories = document.getElementById('maxCalories').value;

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
    const minCaloriesPortions = calculatePortions(minCalories);
    const maxCaloriesPortions = calculatePortions(maxCalories);

    //* APIリクエストの作成
    const apiUrlBreakfast = `https://api.spoonacular.com/recipes/findByNutrients?apiKey=XXX&minProtein=${minProteinPortions.breakfast}&maxProtein=${maxProteinPortions.breakfast}&minFat=${minFatPortions.breakfast}&maxFat=${maxFatPortions.breakfast}&minCarbs=${minCarbsPortions.breakfast}&maxCarbs=${maxCarbsPortions.breakfast}&minCalories=${minCaloriesPortions.breakfast}&maxCalories=${maxCaloriesPortions.breakfast}&number=7`;
    const apiUrlLunch = `https://api.spoonacular.com/recipes/findByNutrients?apiKey=XXX&minProtein=${minProteinPortions.lunch}&maxProtein=${maxProteinPortions.lunch}&minFat=${minFatPortions.lunch}&maxFat=${maxFatPortions.lunch}&minCarbs=${minCarbsPortions.lunch}&maxCarbs=${maxCarbsPortions.lunch}&minCalories=${minCaloriesPortions.lunch}&maxCalories=${maxCaloriesPortions.lunch}&number=7`;
    const apiUrlDinner = `https://api.spoonacular.com/recipes/findByNutrients?apiKey=XXX&minProtein=${minProteinPortions.dinner}&maxProtein=${maxProteinPortions.dinner}&minFat=${minFatPortions.dinner}&maxFat=${maxFatPortions.dinner}&minCarbs=${minCarbsPortions.dinner}&maxCarbs=${maxCarbsPortions.dinner}&minCalories=${minCaloriesPortions.dinner}&maxCalories=${maxCaloriesPortions.dinner}&number=7`;
    // URLの確認
    console.log(apiUrlBreakfast);
    console.log(apiUrlLunch);
    console.log(apiUrlDinner);


    //*結果を1週間分の献立として表示 
    // // APIレスポンスを処理し、レシピを表示する関数
    // function fetchAndDisplayMeals(apiUrl, mealType) {
    //     fetch(apiUrl)
    //         .then(response => response.json())
    //         .then(recipes => {
    //             // データを日ごとに分配して表示
    //             recipes.forEach((recipe, index) => {
    //                 const day = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'][index];
    //                 const mealTime = ['Morning', 'Lunch', 'Dinner'][index % 3];

    //                 const recipeElement = document.createElement('div');
    //                 recipeElement.innerHTML = `
    //                 <h3>${day.toUpperCase()}: ${recipe.title}</h3>
    //                 <img src="${recipe.image}" alt="${recipe.title}">
    //                 <p>Calories: ${recipe.calories}</p>
    //                 <p>Carbs: ${recipe.carbs}</p>
    //                 <p>Fat: ${recipe.fat}</p>
    //                 <p>Protein: ${recipe.protein}</p>
    //             `;
    //                 document.getElementById(`${day}${mealTime}`).appendChild(recipeElement);
    //             });
    //         })
    //         .catch(error => console.error('Error:', error));
    // }
    // // 朝食、昼食、夕食用のAPIリクエストを実行
    // fetchAndDisplayMeals(apiUrlBreakfast, 'breakfast');
    // fetchAndDisplayMeals(apiUrlLunch, 'lunch');
    // fetchAndDisplayMeals(apiUrlDinner, 'dinner');

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
    function displayDummyMeals(dummyRecipes, mealType) {
        // すべてのdayPlanの内容をクリア
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        days.forEach(day => {
            const dayPlanId = `${day}${mealType}`;
            const dayPlanElement = document.getElementById(dayPlanId);
            if (dayPlanElement) {
                dayPlanElement.innerHTML = ''; // 既存のコンテンツをクリア
            }
        });

        // ダミーデータを表示
        dummyRecipes.forEach((recipe, index) => {
            const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'][index];
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

            // クリックして各レシピの詳細ページを表示
            recipeElement.addEventListener('click', () => {
                // 別ウィンドウで表示する場合
                window.open(`https://spoonacular.com/recipes/${recipe.title}-${recipe.id}`, '_blank');
            });

            document.getElementById(`${days}${mealTime}`).appendChild(recipeElement);
        });
    }
    // 表示
    displayDummyMeals(dummyRecipesBreakfast, 'Breakfast');
    displayDummyMeals(dummyRecipesLunch, 'Lunch');
    displayDummyMeals(dummyRecipesDinner, 'Dinner');

});