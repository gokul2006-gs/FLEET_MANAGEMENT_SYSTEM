/**
 * Shared mock factory for Mongoose models.
 * Each mock returns a chainable query builder that mimics Mongoose's fluent API.
 */

function createQueryMock(resultData = []) {
  const chain = {
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    populate: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    then: (resolve) => resolve(resultData),
  };
  return chain;
}

function createModelMock(ModelName, instanceOverrides = {}) {
  const ModelFn = jest.fn((data) => ({
    _id: 'mock-id-' + Date.now().toString(36),
    ...data,
    save: jest.fn().mockResolvedValue({ _id: 'mock-id', ...data }),
    toJSON: jest.fn().mockReturnValue({ _id: 'mock-id', ...data }),
    toObject: jest.fn().mockReturnValue({ _id: 'mock-id', ...data }),
    ...instanceOverrides,
  }));

  // Static methods
  ModelFn.create = jest.fn().mockImplementation((data) => {
    const doc = Array.isArray(data)
      ? data.map((d) => ({ _id: 'mock-id', ...d }))
      : { _id: 'mock-id', ...data };
    return Promise.resolve(doc);
  });

  ModelFn.find = jest.fn().mockReturnValue(createQueryMock([]));
  ModelFn.findOne = jest.fn().mockReturnValue({
    ...createQueryMock(null),
    then: (resolve) => resolve(null),
    select: jest.fn().mockReturnThis(),
  });
  ModelFn.findById = jest.fn().mockReturnValue({
    ...createQueryMock(null),
    then: (resolve) => resolve(null),
    select: jest.fn().mockReturnThis(),
  });
  ModelFn.findByIdAndUpdate = jest.fn().mockResolvedValue(null);
  ModelFn.findByIdAndDelete = jest.fn().mockResolvedValue(null);
  ModelFn.updateMany = jest.fn().mockResolvedValue({ modifiedCount: 0 });
  ModelFn.countDocuments = jest.fn().mockResolvedValue(0);
  ModelFn.aggregate = jest.fn().mockResolvedValue([]);

  return ModelFn;
}

/**
 * Mock all Mongoose models used by the app.
 * Returns an object keyed by model name for easy access in tests.
 */
export function mockAllModels() {
  const User = createModelMock('User');
  const Order = createModelMock('Order');
  const Vehicle = createModelMock('Vehicle');
  const Driver = createModelMock('Driver');
  const Route = createModelMock('Route');
  const Notification = createModelMock('Notification');
  const Depot = createModelMock('Depot');

  return { User, Order, Vehicle, Driver, Route, Notification, Depot };
}

/**
 * Generate a valid JWT-like token for testing.
 * The middleware just calls jwt.verify which we mock, so any string works.
 */
export function fakeToken() {
  return 'test-token-fake-jwt';
}
