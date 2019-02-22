//budget controller
var budgetController = (function (){

  var Expense = function(id, description, value){
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  }

  Expense.prototype.calcPercentage = function(totalIncome){
    if(totalIncome >0){
      this.percentage = Math.round((this.value / totalIncome) * 100)
    } else {
      this.percentage = -1
    }
  }

  Expense.prototype.getPercentage = function(){
    return this.percentage
  }

  var Income = function(id, description, value){
    this.id = id;
    this.description = description;
    this.value = value;
  }

  var calculateTotal = function(type){
    var sum = 0;
    data.allItems[type].forEach(function(curr){
      sum = sum + curr.value;
    })
    data.totals[type] = sum;

  }
  var data = {
    allItems: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1,
  }

  return {
    addItem: function(type, des, val){
      var newItem;
      //create new idea
      if(data.allItems[type].length > 0){
      ID = data.allItems[type][data.allItems[type].length -1].id + 1
    } else {
      ID = 0
    }
      //create new item based on type
      if(type === 'exp'){
        newItem = new Expense(ID, des, val)
      } else if (type === 'inc'){
        newItem = new Income(ID, des, val)
      }
      //push it into new data structure
      data.allItems[type].push(newItem);
      //return new element
      return newItem;
    },

    deleteItem: function(type, id){
      var ids, index;
      ids = data.allItems[type].map(function(current){
        return current.id
      })
      index = ids.indexOf(id)
      if(index !== -1){
        data.allItems[type].splice(index, 1)
      }
    },

    calculateBudget: function(){
      //calc total inc and exp
      calculateTotal('exp');
      calculateTotal('inc');
      //calc budget (inc - exp)
      data.budget = data.totals.inc - data.totals.exp;
      //calc percentage of income that we spent
      if (data.totals.inc > 0) {
      data.percentage = Math.round((data.totals.exp/data.totals.inc) * 100);
      } else {
      data.percentage = -1
      }
    },

    calculatePercentages: function(){
      data.allItems.exp.forEach(function(current){
        current.calcPercentage(data.totals.inc)
      })
    },

    getPercentages: function(){
      var allPerc = data.allItems.exp.map(function(current){
        return current.getPercentage()
      })
      return allPerc
    },

    getBudget: function(){
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage,
      }
    },
    testing: function(){
      console.log(data);
    }
  }
})();

//UI controller
var UIController = (function (){

  var DOMStrings = {
    inputType: '.add__type',
    inputDescription:'.add__description',
    inputValue: '.add__value',
    inputButton: '.add__btn',
    incomeContainer: '.income__list',
    expenseContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expenseLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    container: '.container',
    expensesPercLabel: '.item__percentage',
    dateLabel: '.budget__title--month'

  }

  var formatNumber = function(num, type){
    var numSplit, int, dec, type;
    //exactly 2 decimals
    num = Math.abs(num);
    num = num.toFixed(2);

    //add comma for thousands
    numSplit = num.split('.')
    int = numSplit[0];
      if(int.length > 3){
        int = int.substr(0, int.length - 3) + ',' + int.substr(int.length-3, 3);
      }
    dec = numSplit[1];

    return (type==='exp' ? '-' : '+') + ' ' + int + '.' + dec

  };
  var nodeListForEach = function(list, callback){
    for(let i=0; i < list.length; i++){
      callback(list[i], i)
    }
  }

  return {
    getinput: function(){
      return {
        type: document.querySelector(DOMStrings.inputType).value, //will be either inc or exp
        description: document.querySelector(DOMStrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMStrings.inputValue).value),

      }
    },

    addListItem: function(obj, type){
      var html, newHtml, element;
      //1. create html string with placeholder text
      if(type === 'inc'){
        element = DOMStrings.incomeContainer;

        html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value"> %value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'

      } else if (type === 'exp'){
        element = DOMStrings.expenseContainer;

        html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">%percentage%</div> <div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"> </i></button> </div></div></div>'
      }
      //2. replace placeholder text
      newHtml = html.replace('%id%', obj.id)
      newHtml = newHtml.replace('%description%', obj.description)
      newHtml = newHtml.replace('%value%', formatNumber(obj.value, type))

      //3. insert html into DOM
      document.querySelector(element).insertAdjacentHTML('beforeend', newHtml)
    },

    deleteListItem: function(selectorID){
      var el;

      el = document.getElementById(selectorID);
      el.parentNode.removeChild(el);
    },

    clearFields: function(){
      var fields, fieldsArr;

      fields = document.querySelectorAll(DOMStrings.inputDescription + "," + DOMStrings.inputValue);
      //convert list from querySelectorAll to an array using call and slice
      fieldsArr = Array.prototype.slice.call(fields);
      //loop over items and clear values in input boxes
      fieldsArr.forEach(function(current, index, array){
        current.value = "";
      //puts cursor back to description field
      fieldsArr[0].focus();
    })
  },
    displayBudget: function(obj){
      var type;
      obj.budget > 0 ? type = 'inc' : type = 'exp';

      document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
      document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
      document.querySelector(DOMStrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');

      if(obj.percentage > 0){
        document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%'
      } else {
        document.querySelector(DOMStrings.percentageLabel).textContent = '---'
      }
    },

    displayPercentages: function(percentages){
      var fields = document.querySelectorAll(DOMStrings.expensesPercLabel);

      nodeListForEach(fields, function(current, index){
        if(percentages[index] > 0){
        current.textContent = percentages[index] + '%';
      } else {
        current.textContent = '---'
      }
    })
  },

    displayMonth: function(){
      var now, year, month, months;
      now = new Date()
      months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
      month = now.getMonth()
      year = now.getFullYear();
      document.querySelector(DOMStrings.dateLabel).textContent =  months[month] + ', ' + year
    },

    changeType: function(){
      var fields = document.querySelectorAll(
        DOMStrings.inputType + ',' +
        DOMStrings.inputDescription + ',' +
        DOMStrings.inputValue
      )
      nodeListForEach(fields, function(current){
        current.classList.toggle('red-focus')
      });
      document.querySelector(DOMStrings.inputButton).classList.toggle('red');
    },

    getDOMStrings: function(){
      return DOMStrings;
    }
  }

})();

//global app controller

var controller= (function(budgetCtrl, UICtrl){

  var setupEventListeners = function(){
    var DOM = UICtrl.getDOMStrings();

    document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem);

    document.addEventListener('keypress', function(event){
      if(event.keycode === 13 || event.which === 13){
        ctrlAddItem();
      }
    });

    document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
    document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);
  }

  var updateBudget = function(){
    //1. calculate budget
    budgetCtrl.calculateBudget();
    //2. return budget
    var budget = budgetCtrl.getBudget();
    //3. display updated budget in UI
    UICtrl.displayBudget(budget);
  }

  var updatePercentages = function(){
    //calc percentages
    budgetCtrl.calculatePercentages();

  // read from budget budgetController
  var percentages = budgetCtrl.getPercentages();
  //update UI with new Percentages
  UICtrl.displayPercentages(percentages);
  }

  var ctrlAddItem = function(){
    var input, newItem;

    //1. get field input data
    input = UICtrl.getinput();
    //ensure only a number is entered to affect budget
    if(input.description !== "" && !isNaN(input.value) && input.value > 0){
    //2. add item to budget budgetController
    newItem = budgetCtrl.addItem(input.type, input.description, input.value);
    //3. add item to UI
    UICtrl.addListItem(newItem, input.type);

    UICtrl.clearFields();

    updateBudget();
    // update Percentages
    updatePercentages();
    }
  };

  var ctrlDeleteItem = function(event){
    var itemID, splitID, type, ID;

    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
    if(itemID){
      splitID = itemID.split('-');
      type = splitID[0];
      ID = parseInt(splitID[1]);

      //Delete item from data structure
      budgetCtrl.deleteItem(type, ID);

      //Delete item from UI
      UICtrl.deleteListItem(itemID);
      //update and show the new budget
      updateBudget();
      //update percentages
      updatePercentages();

    }

  }
    return {
      init: function(){
        console.log('application started');
          UICtrl.displayMonth();
          UICtrl.displayBudget({
            budget: 0,
            totalInc: 0,
            totalExp: 0,
            percentage: 0,
          });
        setupEventListeners();
      }
    }

})(budgetController, UIController);

controller.init();
