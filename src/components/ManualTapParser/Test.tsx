import { generateTapFromTestSuite } from "./Functions"
import { TestInformation } from "./Types";

// export let testSuite: TestList<Test, 'major'> = {list:[],type:'major'};

export class TestSuite {
    list: Test[] = [];
    type:  'major' | 'subtest';

    constructor(type: 'major' | 'subtest') {
        this.type = type;
    }
}

export class Test {
    subtests = new TestSuite('subtest');
    testInformation: TestInformation = {
        tap: 'not ok This test was never evaluated',
        type: 'major', 
        successState: 'failed', 
        description: 'There is no test description',
        line: 'not ok',
        attributes: {},
        yaml: this.generateYaml({location: 'This is a server error', message: 'This test has not been correctly implemented'}),
        subtests: this.subtests,
    };
    constructor(testSuite: TestSuite, description: string, type?: 'subtest'){
        if (type === 'subtest') {
            this.testInformation.type = 'subtest'
        }
        testSuite.list.push(this);
        this.testInformation.description = description;
    }
    pass() {
        this.testInformation = {
            tap: 'ok ' +  this.testInformation.description,
            type: this.testInformation.type,
            successState: 'successful',
            description: this.testInformation.description,
            line: 'ok',
            subtests: this.subtests,
        }
        if (this.testInformation.type === 'major'){
           this.testInformation.tap += generateTapFromTestSuite(this.testInformation.subtests)
        }
    }
    fail(attributes: object = {message: 'No message provided'}) {
        this.testInformation = {
            tap: 'not ok ' + this.testInformation.description,
            type: this.testInformation.type, 
            successState: 'failed', 
            description: this.testInformation.description,
            line: 'not ok',
            attributes: attributes,
            yaml: this.generateYaml(attributes),
            subtests: this.subtests
        }        
        if (this.testInformation.type === 'major'){
            this.testInformation.tap += this.generateYaml(attributes)
            this.testInformation.tap += '\n' + generateTapFromTestSuite(this.testInformation.subtests)
        }        
    }
    generateYaml(attributes: any){
        var yaml = '\n' +
            '    ---\n'

        for (const property in attributes) {
            attributes[property] = attributes[property].replace('\xa0', ' ')
            yaml += '    ' + property + ': ' + attributes[property] + '\n';
        }
        yaml += '    ...';
        
        return yaml;
    }
    subtest(description: string){        
        var subtest = new Test(this.subtests, description, 'subtest')
        return subtest
    }
}