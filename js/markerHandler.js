var tableNumber = null;

AFRAME.registerComponent("markerhandler", {
  init: async function () {

    if (tableNumber === null) {
      this.askTableNumber()
    }

    //get the dishes collection from firestore database
    var dishes = await this.getDishes();

    //markerFound event
    this.el.addEventListener("markerFound", () => {
      var markerId = this.el.id;
      this.handleMarkerFound(dishes, markerId);
    });

    //markerLost event
    this.el.addEventListener("markerLost", () => {
      this.handleMarkerLost();
    });

  },
  askTableNumber: function () {
    swal({
      icon: "https://raw.githubusercontent.com/whitehatjr/menu-card-app/main/hunger.png",
      title: "Welcome to our restaurant",
      text: "Choose your table number",
      content: {
        element: "input",
        attributes: {
          placeholder: "Type your table number",
          type: "number",
          min: 1
        }
      },
      closeOnClickOutside: false,
    }).then((userChoice) => {
      tableNumber = userChoice
    })
  },
  handleMarkerFound: function (dishes, markerId) {

    // Getting today's day
    var todaysDate = new Date();
    var todaysDay = todaysDate.getDay();
    // Sunday - Saturday : 0 - 6
    var days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday"
    ];

    //get the dishes 
    var dish = dishes.filter(dish => dish === markerId)[0]
    if (dish.unavailable_days.includes(days[todaysDay])) {
      swal({
        icon: "warning",
        title: dish.name.toUpperCase(),
        text: "This dish is not available today",
        timer: 2500,
        button: false
      })
    }
    else {
      var model = document.querySelector(`#model-${dish.id}`)
      model.setAttribute("position", dish.model_geometry.position);
      model.setAttribute("rotation", dish.model_geometry.rotation);
      model.setAttribute("scale", dish.model_geometry.scale);
      model.setAttribute("visible", true);

      var ingredientsContainer = document.querySelector("#main-plane-${dish.id}")
      ingredientsContainer.setAttribute("visible", true);

      var priceContainer = document.querySelector("#price-plane-${dish.id}")
      priceContainer.setAttribute("visible", true)

      // Changing button div visibility
      var buttonDiv = document.getElementById("button-div");
      buttonDiv.style.display = "flex";

      var ratingButton = document.getElementById("rating-button");
      var orderButtton = document.getElementById("order-button");

      if (tableNumber != null) {
        ratingButton.addEventListener("click", () => {
          swal({
            title: "Rate The Dish!",
            icon: "warning",
          })
        })
        // Handling Click Events
        ratingButton.addEventListener("click", function () {
          swal({
            icon: "warning",
            title: "Rate Dish",
            text: "Thank You For Your Feedback"
          });
        });

        orderButtton.addEventListener("click", () => {
          swal({
            icon: "https://i.imgur.com/4NZ6uLY.jpg",
            title: "Thanks For Order !",
            text: "Your order will serve soon on your table!"
          });
        });
      }

    }


  },

  handleMarkerLost: function () {
    // Changing button div visibility
    var buttonDiv = document.getElementById("button-div");
    buttonDiv.style.display = "none";
  },
  //get the dishes collection from firestore database
  getDishes: async function () {
    return await firebase
      .firestore()
      .collection("dishes")
      .get()
      .then(snap => {
        return snap.docs.map(doc => doc.data());
      });
  },
  handleOrder: function(tNum, dish){
    firebase.firestore().collection("tables").doc(tNum).get().then((index)=>{
      var details = index.data()
      if(details["current_orders"][dish.id]){
        details["current_orders"][dish.id]["quantity"] +=1

        var currentQuantity =  details["current_orders"][dish.id]["quantity"]
        details["current_orders"][dish.id]["sub_total"] = currentQuantity * dish.price
      }else{
        details["current_orders"][dish.id] = {
          item : dish.name,
          price: dish.price,
          quantity:1,
          sub_total: dish.price*1
        }
      }
    })
  }
});
