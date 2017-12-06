var DiEntry = require("../DiEntry.js");

var _uniqueIdentifier = 0;

describe("newCtor", function () {
	test("should set name", function () {
		var expectedName = "stringBuilder";
		var instance = new DiEntry(expectedName);

		expect(instance.name).toBe(expectedName);
	});

	test("should set blueprint", function () {
		var expectedBluePrint = function StringBuilder() { return ""; };
		var instance = new DiEntry("stringBuilder", expectedBluePrint);

		expect(instance.blueprint).toBe(expectedBluePrint);
	});

	test("should set dependenciesProvider", function () {
		var expectedDependenciesProvider = function dp() { return ""; };
		var instance = new DiEntry(undefined, undefined, expectedDependenciesProvider);

		expect(instance.dependenciesProvider).toBe(expectedDependenciesProvider);
	});

	test("should setup default values", function () {
		var instance = new DiEntry();
		expect(instance.dependencies).toEqual([]);
		expect(instance.state).toEqual({});
	});
});

[
	{ name: "singleton ctor", options: { lifecycleStrategy: "singleton", instanceStrategy: "newCtor" }, blueprint: ctorBlueprint },
	{ name: "singleton function", options: { lifecycleStrategy: "singleton", instanceStrategy: "function" }, blueprint: factoryBlueprint },
	{ name: "transient ctor", options: { lifecycleStrategy: "transient", instanceStrategy: "newCtor" }, blueprint: ctorBlueprint },
	{ name: "transient function", options: { lifecycleStrategy: "transient", instanceStrategy: "function" }, blueprint: factoryBlueprint },
].forEach(suitCase => {
	describe("injecting dependencies in .create(), as " + suitCase.name, function () {
		var _dependenciesProvider;
		var _blueprint;
		var _subject;
		var _classes = { "one": {}, "two": {}};

		beforeEach(function () {
			_classes.one.id = _uniqueIdentifier++;
			_classes.two.id = _uniqueIdentifier++;

			_dependenciesProvider = new ProviderMock(_classes);

			_subject = new DiEntry("name", suitCase.blueprint, _dependenciesProvider);
			_subject.applyOptions(suitCase.options);
		});

		[
			{name: "one dependency", input: ["one"], expected: [_classes.one]},
			{name: "two dependency", input: ["one", "two"], expected: [_classes.one, _classes.two]},
			{name: "zero", input: [], expected: []},
		].forEach(testcase => {
			test("should inject dependecies to ctor, when there is " + testcase.name, function () {
				_subject.applyOptions({ dependencies: testcase.input });

				var result = _subject.create();
		
				return expect(result).resolves.toHaveProperty("actualInjected", testcase.expected);
			});
		})

		test("should inject nothing to ctor, when there are implicitly zero dependencies", function () {
			var result = _subject.create();

			return expect(result).resolves.toHaveProperty("actualInjected", []);
		});

		test("should return rejected promise, when dependencies don't exist", function () {
			_subject.applyOptions({ dependencies: ["badDependency"] });

			var result = _subject.create();

			return expect(result).rejects.toEqual("badDependency");
		});
	});
});

describe("singleton strategy", function() {
	var _subject;

	beforeEach(function () {
		_dependenciesProvider = new ProviderMock({});

		_subject = new DiEntry("name", ctorBlueprint, _dependenciesProvider);
	});

	test("should create instance of blueprint", function () {
		var result = _subject.create();

		return expect(result).resolves.toBeInstanceOf(ctorBlueprint);
	});

	test("should only create one instance, when calling .create() twice immedietly", function () {
		expect.assertions(1);
		
		var resultPromises = [_subject.create(), _subject.create()];

		return Promise.all(resultPromises).then(function ([firstResult, secondResult]) {
			return expect(secondResult).toBe(firstResult);
		});
	});

	test("should only create one instance, when calling .create() twice sequencially", function () {
		expect.assertions(1);

		var firstPromise = _subject.create();

		return firstPromise.then(function (firstResult) {
			var secondResult = _subject.create();

			return expect(secondResult).resolves.toBe(firstResult);
		});
	});
});

describe("transient strategy", function() {
	var _subject;

	beforeEach(function () {
		_dependenciesProvider = new ProviderMock({});

		_subject = new DiEntry("name", ctorBlueprint, _dependenciesProvider);
		_subject.applyOptions({ lifecycleStrategy: "transient", instanceStrategy: "newCtor" });
	});

	test("should create instances of type blueprint, when creating calling .create() more than once", function () {
		expect.assertions(2);
		var resultOne = _subject.create();
		var resultTwo = _subject.create();

		return Promise.all([
			expect(resultOne).resolves.toBeInstanceOf(ctorBlueprint),
			expect(resultTwo).resolves.toBeInstanceOf(ctorBlueprint)
		]);
	});

	test("should create two distinct instances, when calling .create() twice immedietly", function () {
		expect.assertions(1);
		
		var resultPromises = [_subject.create(), _subject.create()];

		return Promise.all(resultPromises).then(function ([firstResult, secondResult]) {
			return expect(secondResult).not.toBe(firstResult);
		});
	});

	test("should create two distinct instances, when calling .create() twice sequencially", function () {
		expect.assertions(1);

		var firstPromise = _subject.create();

		return firstPromise.then(function (firstResult) {
			var secondResult = _subject.create();

			return expect(secondResult).resolves.not.toBe(firstResult);
		});
	});
});

describe("singleton instance strategy", function(){
	var _subject;
	var _blueprintInstance;

	beforeEach(function(){
		_blueprintInstance = { id: _uniqueIdentifier++ };
		var dependenciesProvider = new ProviderMock();

		_subject = new DiEntry("name", _blueprintInstance, dependenciesProvider);

		_subject.applyOptions({
			asSingletonInstance: true
		});

	});

	test("should provide instance", function(){
		var result = _subject.create();

		expect(result).resolves.toBe(_blueprintInstance);
	});

	test("should have singleton as lifecycle strategy", function(){
		expect(_subject.lifecycleFactory).toBe(DiEntry.prototype.strategies.lifecycle.singleton)
	});
});

function ProviderMock(classMap) {
	this.get = function (name) {
		if (!classMap.hasOwnProperty(name)){
			return Promise.reject("badDependency");
		}
		return classMap[name];
	}
}

function ctorBlueprint() {
	this.actualInjected = Array.from(arguments); this.id = _uniqueIdentifier++;
}
function factoryBlueprint() {
	return { actualInjected: Array.from(arguments), id: _uniqueIdentifier++ };
}