Questions = new Meteor.Collection("questions");
questionsHandle = Meteor.subscribe("questions");
//Responses = new Meteor.Collection("responses");

if (Meteor.isClient) {
    Template.home.helpers({
        questions: function() {
            return Questions.find();
        }
    });

    Template.teacher_summary.helpers({
        questions: function() {
            return Questions.find();
        }
    });


    Template.new.events({

        /* Add click events for new buttons */

        /* Consider moving custom question form to a new template */

        /* check for question type (t/f, mc2, mc3, etc. and create question_data based on that */

        'click .tf': function(event, template) {
			console.log('t/f click');
			if (Questions.findOne({status:{$in:['active', 'inactive']}}) != undefined) {
				Questions.update( Questions.findOne({status:{$in:['active', 'inactive']}})._id, {$set:{status:null}})
			}
			var question_data = {
				title: 'True/False',
				type: 'tf',
				choice1: 'True',
				choice2: 'False',
				status: 'active',
				True: 0,
				False: 0
			}
			
			var question_id = Questions.insert(question_data, function(err) { /* handle error */ });
            Router.go('/teacher/' + question_id);
        },

        'click #mc3': function() {
			
        },

        'click #mc4': function() {

        },

        'click #mc5': function() {

        },

        'submit form': function (event, template) {
            event.preventDefault();
			//disable current launched question
			if (Questions.findOne({status:{$in:['active', 'frozen']}}) != undefined){
			Questions.update( Questions.findOne({status:{$in:['active', 'frozen']}})._id, {$set:{status:null}})
			}
			//create new question and launch it
            var title = template.find("input[name=title]");
            var choice1 = template.find("input[name=choice_1]");
            var choice2 = template.find("input[name=choice_2]");
            var choice3 = template.find("input[name=choice_3]");
            var choice4 = template.find("input[name=choice_4]");
            var correct = $('input[name="correct"]:checked').val(); //in form A, B, C, or D
            if (correct == null){
                console.log('ERROR: nothing chosen. Please choose a correct answer.')
                $('#publishFeedback').html('ERROR: nothing chosen. Please choose a correct answer.');
            }

            var question_data = {
                title: title.value,
				type: 'custom',
                choice1: choice1.value,
                choice2: choice2.value,
                choice3: choice3.value,
                choice4: choice4.value,
                correct: correct,
                status: 'active', //active, frozen, inactive - not being launched
				A: 0,
				B: 0,
				C: 0,
				D: 0,
				options: ['A', 'B', 'C', 'D']
			};
			
			
			/*console.log('options: ' + question_data.options);
			var a = question_data.options[0];
			console.log('test: ' + a + question_data.a);*/

            //reset fields
            title.value = "";
            choice1.value = "";
            choice2.value = "";
            choice3.value = "";
            choice4.value = "";
            $('input[name="correct"]').each(function() {
                this.checked = false;
            });

            var question_id = Questions.insert(question_data, function(err) { /* handle error */ });
			console.log("new end");
            Router.go('/teacher/home');
        }
  });
	
	Template.teacher_question_view.events({
		'click #change_mode': function (event, template){
			console.log('here', Questions.findOne(this.question_id));
			if (Questions.findOne(this.question_id).status == 'active'){
				Questions.update( this.question_id, {$set:{status:'frozen'}});
			}else{
				Questions.update( this.question_id, {$set:{status:'active'}})
			}															
		}
	})

    Template.teacher_summary.events({
        'change [name="launch"]': function (event, template){
            Questions.update({}, {$set:{status:'inactive'}});
			var selectionBox = event.target.parentElement.id;
			//selectionBox.append('<input type="radio">');
			//console.log("target", event.target.parentElement.lastChild)
            Questions.update(this._id, {$set:{status:'active'}});
        },
        'click .delete': function (event, template){
            Questions.remove(this._id)
        }

    })

    Template.question_view.events({
        'submit #student_question': function (event, template) {
			console.log(this, 'student');
            event.preventDefault();
			console.log(this.status)
			if (this.status == 'active'){
				var choice = template.find("input[name='choice']:checked");
				if (choice == null) {
					console.log('ERROR: nothing chosen. Please choose an answer.')
					$('#submitFeedback').html('ERROR: nothing chosen. Please choose an answer.');
				}
				else {
					var user_answer = choice.value;
					var id = this._id;
					console.log('id ' + id)
					var question = Questions.findOne(id);
					/*var answer_data = {
						question_id: id,
						answer: user_answer,
						user: Meteor.userId()
					};*/

					//var answer_id = Answers.insert(answer_data, function(err) { /* handle error */ });

					switch (user_answer) { /* add E, T, F */
						case 'A':
							Questions.update(id, { $inc: {A: 1} });
							break;
						case 'B':
							Questions.update(id, {$inc: {B: 1}});
							break;
						case 'C':
							Questions.update(id, {$inc: {C: 1}});
							break;
						case 'D':
							Questions.update(id, {$inc: {D: 1}});
							break;
						case 'E':
							Question.update(id, {inc: {E: 1}});
							break;
						case 'T':
							Question.update(id, {inc: {True: 1}});
							break;
						case 'F':
							Question.update(id, {inc: {False: 1}});
							break;
					}
					$('#submitFeedback').html('Your submission is '+user_answer);
				}
			}else{
				$('#submitFeedback').html('Question submission is closed')
			}
	}
		
    });


    Template.teacher_question_view.rendered = function(){
        // $(this.find("#container_teacher_question_view")).append("<div>GOOD MORNING: "+this.data.title+"</div>");
        var teachQuestViewTemp = $(this.find("#container_teacher_question_view"));
        teachQuestViewTemp.append("<br><br>")
        teachQuestViewTemp.append("<div>Random Temporary Thing: "+ this.data.title+"</div>");
        teachQuestViewTemp.append("<div class='chart'></div>");

        console.log("THIS THING");

        var percentages = []
        var optionsLen = this.data.options.length;
        for (var jj=0; jj < optionsLen; jj++){
            percentages.push(this.data.options[jj].percent);
            console.log(this.data.options[jj].percent);
        }
        console.log(this);

        var width = 420;
        var barHeight = 20;
        var x = d3.scale.linear()
            .domain([0, d3.max(percentages)])
            .range([0, width]);
        var chart = d3.select(".chart")
            .attr("width", width)
            .attr("height", barHeight * optionsLen);
        var bar = chart.selectAll("g")
            .data(percentages)
            .enter().append("g")
            .attr("transform", function(d, i) { return "translate(0," + i * barHeight + ")"; });
        bar.append("rect")
            .attr("width", x)
            .attr("height", barHeight - 1);
        bar.append("text")
            .attr("x", function(d) { return x(d) - 3; })
            .attr("y", barHeight / 2)
            .attr("dy", ".35em")
            .text(function(d) { return d; });

        }

}

if (Meteor.isServer) {
    Meteor.startup(function () {
        // code to run on server at startup
        //certificate auth should be here eventually
    });
}

/*
arg question = question data object
arg question_type = string -- 'tf' = true/false, 'mc2' = MC (2 choice), 'mc3' = MC (3 choice), etc.
*/
var calcPercentages = function(question, question_type) {
	var total = 0;
	var a = 0;
	var b = 0;
	var c = 0;
	var d = 0;
	var tr = 0;
	var fal = 0;
	switch (question_type) {
		case 'tf':
			total = question.True + question.False;
			if (total != 0) {
				tr = 100.0*(question.True / total);
				fal = 100.0*(question.False / total);
			}
			return [total, tr.toFixed(0), fal.toFixed(0)];
		case 'custom':
			total = question.A + question.B + question.C + question.D;
			a = 100.0*(question.A / total);
			b = 100.0*(question.B / total);
			c = 100.0*(question.C / total);
			d = 100.0*(question.D / total);
			return [total, a.toFixed(0), b.toFixed(0), c.toFixed(0), d.toFixed(0)];
	}
}

var passData = function() {
	var question = Questions.findOne({status:{$in:['active', 'frozen']}}); //get question that is currently active or frozen
	var question_id = question._id;
	var options_list = question.options;

	if (question.status == 'active') {
		var status_control = 'to freeze';	
	} else {
		var status_control = 'to activate';	
	}

	var stats = calcPercentages(question, question.type)
	var options = {};
	if (question.type == 'tf') {
		options.push(
			{
				option: '',
				choice: question.choice1,
				voters: question.True,
				percent: stats[1]
			},
			{
				option: '',
				choice: question.choice2,
				voters: question.False,
				percent: stats[2]
			}
		);
	} else if (question.type == 'custom') {
		options.push(
			{
				option: 'A',
				choice: question.choice1,
				voters: question.A,
				percent: stats[1]
			},
			{
				option: 'B',
				choice: question.choice2,
				voters: question.B,
				percent: stats[2]
			},
			{
				option: 'C',
				choice: question.choice3,
				voters: question.C,
				percent: stats[3]
			},
			{
				option: 'D',
				choice: question.choice4,
				voters: question.D,
				percent: stats[4]
			}
		);
	}
	/*for (i in options_list) {
		var option = options_list[i];

	}*/
	return {
		question_id: question_id,
		status_control:status_control,
		options: options,
		title: question.title,
		correct: question.correct,
		total: stats[0]
	}		
}

//Templates needed: teacher, home, question, teacher_question_view
Router.map(function () {
    this.route('home', {
        path: '/',
    });

    this.route('teacher_home', {
        path: 'teacher/home',
		template: function() {
			if (Questions.findOne({status:{$in:['active', 'frozen']}}) == undefined){
				return 'new'
			}else{
				return 'teacher_question_view'}
			},
		waitOn: function(){
            return Meteor.subscribe("questions")
        },
		data: passData()
		/*data: function() {
            var question = Questions.findOne({status:{$in:['active', 'frozen']}});
		    var question_id = question._id;
			if (question.status == 'active'){
				var status_control = 'to freeze';
			}else{
				var status_control = 'to activate';
			}
            //var answers = Answers.find().fetch();
            //console.log("teach home", question)
            //console.log('userID: ' + Meteor.userId());
            var total = question.A + question.B + question.C + question.D;
            var percentA = 0;
            var percentB = 0;
            var percentC = 0;
            var percentD = 0;
			var percent

            if (total != 0) {
                percentA = 100.0*(question.A / total);
                percentB = 100.0*(question.B / total);
                percentC = 100.0*(question.C / total);
                percentD = 100.0*(question.D / total);
            }

            var options = []
            options.push(
                {
                    option: "A",
                    choice: question.choice1,
                    voters: question.A,
                    percent: percentA.toFixed(0)
                },
                {
                    option: "B",
                    choice: question.choice2,
                    voters: question.B,
                    percent: percentB.toFixed(0)
                },
                {
                    option: "C",
                    choice: question.choice3,
                    voters: question.C,
                    percent: percentC.toFixed(0)
                },
                {
                    option: "D",
                    choice: question.choice4,
                    voters: question.D,
                    percent: percentD.toFixed(0)
                }
            );

            return {
				question_id: question_id,
				status_control:status_control,
                options: options,
                title: question.title,
                correct: question.correct,
                total: total
            }
        }*/
    });

	this.route('teacher_summary', {
        path: 'teacher/summary',
    });

    this.route('question_view', {
        path: '/student',  //overrides the default '/home'
        template: 'question_view',
        data: function() {
			return Questions.findOne({status:{$in:['active', 'frozen']}}); }
    });

    this.route('teacher_new', {
        path: '/teacher/new',
        template: 'new',
    });
    this.route('teacher_question_view', {
        path: '/teacher/:_id',
        waitOn: function(){
            return Meteor.subscribe("questions")
        }
        ,
        template: 'teacher_question_view',
		data: passData()
        /*data: function() {
			var question_id = this.params._id;
            var question = Questions.findOne(question_id);
			if (question.status == 'active'){
				var status_control = 'to freeze';
			}else if(question.status == 'frozen'){
				var status_control = 'to activate';
			}else{
				var status_control = 'launch the question';
			}
			
            //var answers = Answers.find().fetch();
            console.log('userID: ' + Meteor.userId());
            var total = question.A + question.B + question.C + question.D;
            var percentA = 0;
            var percentB = 0;
            var percentC = 0;
            var percentD = 0;

            if (total != 0) {
                percentA = 100.0*(question.A / total);
                percentB = 100.0*(question.B / total);
                percentC = 100.0*(question.C / total);
                percentD = 100.0*(question.D / total);
            }

            var options = []
            options.push(
                {
                    option: "A",
                    choice: question.choice1,
                    voters: question.A,
                    percent: percentA.toFixed(0)
                },
                {
                    option: "B",
                    choice: question.choice2,
                    voters: question.B,
                    percent: percentB.toFixed(0)
                },
                {
                    option: "C",
                    choice: question.choice3,
                    voters: question.C,
                    percent: percentC.toFixed(0)
                },
                {
                    option: "D",
                    choice: question.choice4,
                    voters: question.D,
                    percent: percentD.toFixed(0)
                }
            );

            return {
				question_id: question_id,
				status_control: status_control,
                options: options,
                title: question.title,
                correct: question.correct,
                total: total
            }
        },*/
    });
});
