//When a javascript runtime hits the 1st line
//it gets executed and the annomous function gets declared and immediately
//called or invoked because of the operator on line 12
  //then these variablesb and functions are declared starting line 3
  //then we return an object which contains the method we call publicTest
  //this object gets assigned to the budgetController variable after the function returns
  //so... the budgetController variable is simply an object containing the method called:
  //publicTest
//------------------------------------------------------------------------------

//Budget Controller
var budgetController = (function(){
    var Expense = function(id, description, value){
      this.id = id;
      this.description = description;
      this.value = value;
    };

    var Income = function(id, description, value){
      this.id = id;
      this.description = description;
      this.value = value;
    };

    var calculateTotal = function(type){
      var sum = 0;
      data.allItems[type].forEach(function(cur){
        sum += cur.value;
      });
      data.totals[type] = sum;
    };

//data structure ready to receive data
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
      percentage: -1//non exist
    };

    return {
        addItem: function(type, des, val){//method that takes in type, description and value of our input
            var newItem, ID;

            //create new ID
            if (data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length -1].id + 1;
            } else {
              ID = 0;
            }
            //create new item based on 'income' or 'expense' type
            if(type === 'exp') {
              newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
              newItem = new Income(ID, des, val);
            }
            //after we have a new item, we push it in our data structure
            data.allItems[type].push(newItem);//type is exp or inc, which are the same in our data structure, then push interval
            //return the new element
            return newItem;
        },

        calculateBudget: function(){

          //1. calculate the budget
          calculateTotal('exp');
          calculateTotal('inc');

          //2. calculate the budget: income - expenses
          data.budget = data.totals.inc - data.totals.exp;

          //3.calculate the percentage of income that we spent
          if(data.totals.inc > 0){
            data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
          } else {
            data.percentage = -1;
          }
        },

        getBudget: function(){
           return {
             budget: data.budget,
             totalInc: data.totals.inc,
             totalExp: data.totals.exp,
             percentage: data.percentage
           }
        },

        testing: function(){
          console.log(data);
        }
    };

})();

//UI Controller
var UIController = (function(){
      //central place where all strings are stored, we can then retrieve them and change them
      var Domstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLable: '.budget__income--value',
        expensesLable: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage'
      }

      return {
        getInput: function(){
          return {
            //3 input values stored as parameters
            type: document.querySelector(Domstrings.inputType).value,//read the value,income or expens
            description: document.querySelector(Domstrings.inputDescription).value,
            value: parseFloat(document.querySelector(Domstrings.inputValue).value)
          };
        },

        addListItem: function(obj, type){
            //create html string with placeholder text
            var html, newHTML, element;

            if (type === 'inc') {
              element = Domstrings.incomeContainer;
              html = '<div class="item clearfix" id="income-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div></div> </div>'
            } else if (type === 'exp') {
              element = Domstrings.expensesContainer;
              html = '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            //replace the placeholder text with some actual Data
            newHTML = html.replace('%id', obj.id);//searches for a string and replaces that string with data we put into that method
            newHTML = newHTML.replace('%description%', obj.description);
            newHTML = newHTML.replace('%value%', obj.value);

            //insert the html in the dom
            document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);
        },

        clearFields: function(){
          var fields, fieldsArr ;

          fields = document.querySelectorAll(Domstrings.inputDescription + ' ,' + Domstrings.inputValue);

          fieldsArr = Array.prototype.slice.call(fields)//trick slice method into thinking we give it an array

          fieldsArr.forEach(function(current, index, array){//loops through all of the elements of field arr
            current.value = "";//sets the value of all of them to an empty string
          });

          fieldsArr[0].focus();//goes right back to description field
        },

        displayBudget: function(obj){
            document.querySelector(Domstrings.budgetLabel).textContent = obj.budget;
            document.querySelector(Domstrings.incomeLable).textContent = obj.totalInc;
            document.querySelector(Domstrings.expensesLable).textContent = obj.totalExp;
            document.querySelector(Domstrings.percentageLabel).textContent = obj.percentage;

            if (obj.percentage > 0 ){
              document.querySelector(Domstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
              document.querySelector(Domstrings.percentageLabel).textContent = '----';

            }
        },

        getDomstrings: function(){
          //exposing Domstrings into the public
            return Domstrings;
        }
      };
  })();

//Global App Controller
var controller = (function(budegetCtrl, UICtrl){

      var setupEventListeners = function(){

          var Dom = UICtrl.getDomstrings();//now inside of this Dom var, we also have the Domstrings, since we exposed them publicly
          document.querySelector(Dom.inputBtn).addEventListener('click', ctrlAddItem);
          document.addEventListener('keypress', function(event){
              if(event.keyCode === 13 || event.which === 13){//return key
                ctrlAddItem();
            }
        });
      }

      var updateBudget = function(){
        //1. calculate the budget
        budegetCtrl.calculateBudget();
        //2. return budget
        var budget = budegetCtrl.getBudget();
        //3. display the budget on the UI
        UICtrl.displayBudget(budget);
      }

      var ctrlAddItem = function(){
        var input, newItem;
        //1. get the field input Data
        input = UICtrl.getInput();

        //input description should not be empty, and the number should not be (not a number) AND value should always be greater than 0
        if (input.description !== "" && !isNaN(input.value) && input.value > 0){
          //2. add item to the budget Controller
          newItem = budegetCtrl.addItem(input.type, input.description, input.value);

          //3. add the item to the UI
          UICtrl.addListItem(newItem, input.type);

          //4. clear the fields
          UICtrl.clearFields();

          //5.calculate and update budget
          updateBudget();
        }
      };

      return {
        init: function(){
          console.log('app has started');
          setupEventListeners();
        }
      };
})(budgetController, UIController);

controller.init();//without this line of code, nothing will happen
//without event lsners we can not input Data
//without data we have no app
