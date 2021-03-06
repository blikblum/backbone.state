/* eslint-env jest */
import { ResourceModel, createResourceSync } from '../../src/index'
import { Model, Collection } from 'backbone'

const resourceDefs = [
  {
    'name': 'patient',
    'path': 'patients',
    'params': [
      {
        'name': 'registry',
        'location': 'query'
      }
    ]
  },
  {
    'name': 'patientbyregistry',
    'path': 'patients/search',
    'params': [
      {
        'name': 'registry',
        'location': 'query',
        'required': true
      },
      {
        'name': 'name',
        'location': 'query'
      }
    ]
  },
  {
    'name': 'patientaccompaniment',
    'path': 'patients/:patientid/accompaniments',
    'params': [
      {
        'name': 'patientid'
      }
    ]
  },
  {
    'name': 'accompanimentdata',
    'path': 'patients/:patientid/accompanimentdata',
    'params': [
      {
        'name': 'patientid'
      }
    ],
    'idAttribute': ''
  },
  {
    'name': 'patientevaluation',
    'path': 'patients/:patientid/evaluations',
    'params': [
      {
        'name': 'patientid'
      }
    ],
    'idAttribute': 'date'
  },
  {
    'name': 'crdpatient',
    'path': 'patients/crd'
  }
]

const baseUrl = 'http://base/'

const resourceClient = {
  baseUrl: baseUrl,
  resourceDefs: resourceDefs
}

describe('createResourceSync', () => {
  let originalSyncSpy
  let resourceSync
  let model
  let options

  beforeEach(() => {
    originalSyncSpy = jest.fn()
    resourceSync = createResourceSync(originalSyncSpy)
  })

  describe('with a model without resource', () => {
    beforeEach(() => {
      model = new Model()
      options = {parse: true}
    })

    test('should pass unaltered options', () => {
      resourceSync('read', model, options)
      expect(originalSyncSpy).toBeCalledWith('read', model, options)
    })
  })

  describe('with a empty model', () => {
    beforeEach(() => {
      model = new Model()
      model.resourceClient = resourceClient
      options = {}
    })

    const cases = test.each`
      resource | params | url
      ${'patient'} | ${{}} | ${'patients'}
      ${'patient'} | ${{registry: 2}} | ${'patients?registry=2'}
      ${'patientbyregistry'} | ${{registry: 3, name: 'luiz'}} | ${'patients/search?registry=3&name=luiz'}
      ${'patientaccompaniment'} | ${{patientid: 1}} | ${'patients/1/accompaniments'}      
      ${'crdpatient'} | ${{}} | ${'patients/crd'}      
      `
    cases('should pass options with url = $url when resource is $resource and params is $params', ({resource, params, url}) => {
      const expectedUrl = baseUrl + url
      model.resource = resource
      model.params = params
      resourceSync('read', model, options)
      expect(originalSyncSpy).toBeCalledWith('read', model, {url: expectedUrl})
    })
  })

  describe('with a initialized model', () => {
    beforeEach(() => {
      model = new Model({id: 10})
      model.resourceClient = resourceClient
      options = {}
    })

    const cases = test.each`
      resource | params | url
      ${'patient'} | ${{}} | ${'patients/10'}
      ${'patient'} | ${{registry: 2}} | ${'patients/10?registry=2'}      
      ${'patientaccompaniment'} | ${{patientid: 1}} | ${'patients/1/accompaniments/10'}      
      ${'crdpatient'} | ${{}} | ${'patients/crd/10'} 
      `
    cases('should pass options with url = $url when resource is $resource and params is $params', ({resource, params, url}) => {
      const expectedUrl = baseUrl + url
      model.resource = resource
      model.params = params
      resourceSync('read', model, options)
      expect(originalSyncSpy).toBeCalledWith('read', model, {url: expectedUrl})
    })
  })

  describe('with a collection', () => {
    let collection
    beforeEach(() => {
      collection = new Collection()
      collection.resourceClient = resourceClient
      options = {}
    })

    const cases = test.each`
      resource | params | url
      ${'patient'} | ${{}} | ${'patients'}
      ${'patient'} | ${{registry: 2}} | ${'patients?registry=2'}
      ${'patientbyregistry'} | ${{registry: 3}} | ${'patients/search?registry=3'}
      ${'patientaccompaniment'} | ${{patientid: 1}} | ${'patients/1/accompaniments'}    
      ${'crdpatient'} | ${{}} | ${'patients/crd'}      
      `
    cases('should pass options with url = $url when resource is $resource and params is $params', ({resource, params, url}) => {
      const expectedUrl = baseUrl + url
      collection.resource = resource
      collection.params = params
      resourceSync('read', collection, options)
      expect(originalSyncSpy).toBeCalledWith('read', collection, {url: expectedUrl})
    })
  })

  describe('with custom idAttribute', () => {
    beforeEach(() => {
      model = new Model({id: 10, date: 2000})
      model.resourceClient = resourceClient
      options = {}
    })

    const cases = test.each`
      resource | params | url      
      ${'patientevaluation'} | ${{patientid: 3}} | ${'patients/3/evaluations/2000'}
      `
    cases('should pass options with url = $url when resource is $resource and params is $params', ({resource, params, url}) => {
      const expectedUrl = baseUrl + url
      model.resource = resource
      model.params = params
      resourceSync('read', model, options)
      expect(originalSyncSpy).toBeCalledWith('read', model, {url: expectedUrl})
    })
  })

  describe('with empty idAttribute', () => {
    beforeEach(() => {
      model = new Model({id: 10})
      model.resourceClient = resourceClient
      options = {}
    })

    const cases = test.each`
      resource | params | url
      ${'accompanimentdata'} | ${{patientid: 2}} | ${'patients/2/accompanimentdata'}      
      `
    cases('should pass options with url = $url when resource is $resource and params is $params', ({resource, params, url}) => {
      const expectedUrl = baseUrl + url
      model.resource = resource
      model.params = params
      resourceSync('create', model, options)
      expect(originalSyncSpy).toBeCalledWith('update', model, {url: expectedUrl})
    })
  })
})
