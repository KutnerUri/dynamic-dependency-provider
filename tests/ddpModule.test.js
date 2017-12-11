var DdpModule = require("../DdpModule.js");

describe("ddpModule tests", function(){
	var _providers;
	var _entryProtoMock;
	var _subject;

	beforeEach(function() {
		_providers = [{}, {}];
		_entryProtoMock = function(){};

		_subject = new DdpModule(_providers, _entryProtoMock);
	});

	test(".remove should call all providers' delete method", function(){
		_providers[0].delete = jest.fn();
		_providers[1].delete = jest.fn();

		_subject.remove("someName");

		expect(_providers[0].delete).toHaveBeenCalledWith("someName");
		expect(_providers[0].delete).toHaveBeenCalledTimes(1);
		expect(_providers[1].delete).toHaveBeenCalledWith("someName");
		expect(_providers[1].delete).toHaveBeenCalledTimes(1);

		expect(_providers[0].delete).toHaveBeenCalledWith("someName");
	});

	test(".get() should use value from provider, when first provider returns the value", function(){
		var mockedEntry = { create: jest.fn().mockReturnValue("instance") };
		_providers[0].get = jest.fn()
			.mockReturnValue(mockedEntry);
		_providers[1].get = jest.fn();

		var result = _subject.get("someName");

		expect(result).resolves.toEqual("instance");
	});

	test(".get() should not call second provider, when first provider returns the value", function(){
		expect.assertions(1);
		var mockedEntry = { create: jest.fn().mockReturnValue("instance") };
		_providers[0].get = jest.fn()
			.mockReturnValue(mockedEntry);
		_providers[1].get = jest.fn();

		var result = _subject.get("someName");

		return result.then(function(){ 
			expect(_providers[1].get).not.toHaveBeenCalled();
		});
	});

	test(".get() should use value from second provider, when first provider returns falsy", function(){
		var mockedEntry = { create: jest.fn().mockReturnValue("instance") };
		_providers[0].get = jest.fn()
			.mockReturnValue(undefined);
		_providers[1].get = jest.fn()
			.mockReturnValue(mockedEntry);

		var result = _subject.get("someName");
		
		return expect(result).resolves.toEqual("instance");
	});

	test(".get() should throw exception, when no provider returns value", function(){
		var mockedEntry = { create: jest.fn().mockReturnValue("instance") };
		_providers[0].get = jest.fn()
			.mockReturnValue(undefined);
		_providers[1].get = jest.fn()
			.mockReturnValue(undefined);

		var result = _subject.get("someName");
		
		return expect(result).rejects.toEqual('DDI: Failure resolving "someName":\nEnd of chain');
	});
});