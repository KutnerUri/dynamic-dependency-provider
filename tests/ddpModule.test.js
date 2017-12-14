var DdpModule = require("../DdpModule.js");

describe("ddpModule tests", function(){
	var _providers;
	var _entryProtoMock;
	var _subject;
	var _entryProtoCreateMock

	beforeEach(function() {
		_providers = [{fetch: jest.fn()}, {fetch: jest.fn()}];
		_entryProtoCreateMock = jest.fn();
		_entryProtoMock = jest.fn().mockImplementation(function() {
			this.setDependenciesProvider =  jest.fn();
			this.create = _entryProtoCreateMock;
		});

		_subject = new DdpModule(_providers, _entryProtoMock);
	});

	test(".entry() should return a new entry, when called once", function(){
		var result = _subject.entry("entryName");

		expect(result).toBeInstanceOf(_entryProtoMock);
	});

	test(".entry() should set this as dependency provider, when called once", function(){
		var result = _subject.entry("entryName");

		expect(result.setDependenciesProvider).toHaveBeenCalledTimes(1);
		expect(result.setDependenciesProvider).toHaveBeenCalledWith(_subject);
	});

	test(".entry() should return the same entry, when called two or more times", function(){
		var firstResult = _subject.entry("entryName");
		var secondResult = _subject.entry("entryName");

		expect(secondResult).toBe(secondResult);
	});

	test(".get() should create instance, when entry name is cached", function(){
		var entry = _subject.entry("entryName");
		entry.create = function () { return "expectedInstance"; };

		var result = _subject.get("entryName");

		expect(result).toBe("expectedInstance");
	});

	test(".get() should throw, when entry is not cached, and no provider handles it", function(){
		_providers[0].canHandle = () => false;
		_providers[1].canHandle = () => false;

		expect(() => _subject.get("nonexistingEntryName"))
			.toThrow('DDP: cannot find a provider to resolve: "nonexistingEntryName"');
	});

	test(".get() should call first provider only, when it handles the request", function(){
		_providers[0].canHandle = val => val == "entryName";
		_providers[1].canHandle = jest.fn();

		_subject.get("entryName");

		expect(_providers[1].canHandle).not.toHaveBeenCalled();
		expect(_providers[1].fetch).not.toHaveBeenCalled();
	});
	
	test(".get() should use entry from provider, when fetch returns it", function(){
		var providedEntry = { create: jest.fn().mockReturnValue("expectedValue") };
		_providers[0].canHandle = val => val == "entryName";
		_providers[0].fetch = () => providedEntry;

		var result = _subject.get("entryName");

		expect(result).toBe("expectedValue");
	});

	test(".get() should cache result from provider, when fetch returns it", function(){
		var providedEntry = { create: jest.fn() };
		_providers[0].canHandle = val => val == "entryName";
		_providers[0].fetch = () => providedEntry;

		var sanityResult = _subject.peek("entryName");
		expect(sanityResult).toBeUndefined();

		_subject.get("entryName");

		var result = _subject.peek("entryName");
		expect(result).toBe(providedEntry);
	});

	test(".get() should create new entry, when provider returns nothing", function(){
		_providers[0].canHandle = val => val == "entryName";
		_entryProtoCreateMock.mockReturnValue("createResult");

		var result = _subject.get("entryName");

		expect(result).toBe("createResult")
	});

	test(".get() should cache newly created entry, when provider returns nothing", function(){
		_providers[0].canHandle = val => val == "entryName";

		_subject.get("entryName");

		var expected = _entryProtoMock.mock.instances[0];
		var result = _subject.peek("entryName");
		expect(result).toBe(expected);
		expect(_entryProtoMock.mock.instances.length).toBe(1);
	});

	test(".get() should create only one instance, when provider returns nothing", function(){
		_providers[0].canHandle = val => val == "entryName";

		_subject.get("entryName");

		expect(_entryProtoMock.mock.instances.length).toBe(1);
	});

	test(".peak() should return nothing, when entry is not cached", function(){
		var result = _subject.peek("entryName");

		expect(result).toBeUndefined();
	});

	test(".peak() should return existing entry, when entry is cached", function(){
		var expected = _subject.entry("entryName");
		
		var result = _subject.peek("entryName");

		expect(result).toBe(expected);
	});
});