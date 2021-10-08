import { Input, Collapse, Row, Col } from 'antd';
import React, { useState } from 'react';
import '../../css/ManualTapParser.css'
import 'antd/dist/antd.css';
const Parser = require('tap-parser');
const parserOptions = {omitVersion: true, passes: true};
const { Panel } = Collapse;


type TestList<Test, type> = 
    | {list: Array<Test>, type: 'major'}
    | {list: Array<Test>, type: 'subtest'}

type FailedTestInformation = { 
    tap: string,
    successState: 'failed', 
    description: string,
    line: 'not ok',
    location: string, 
    message: string,
    yaml: string,
    subtests: TestList<Test, 'subtest'>,
}

type SuccessfulTestInformation = { 
    tap: string,
    successState: 'successful',
    description: string,
    line: 'ok',
    subtests: TestList<Test, 'subtest'>
}

type FailedMajorTestInformation = {type: 'major'} & FailedTestInformation
type FailedSubtestInformation = {type: 'subtest'} & FailedTestInformation
type SuccessfulMajorTestInformation = {type: 'major'} & SuccessfulTestInformation
type SuccessfulSubtestInformation = {type: 'subtest'} & SuccessfulTestInformation

type MajorTestInformation = 
    | SuccessfulMajorTestInformation
    | FailedMajorTestInformation

type SubtestInformation = 
    | SuccessfulSubtestInformation
    | FailedSubtestInformation

type TestInformation =
    | MajorTestInformation
    | SubtestInformation

let testSuite: TestList<Test, 'major'> = {list:[],type:'major'};

class Test {
    testInformation: TestInformation = {
        tap: 'not ok This test was never evaluated',
        type: 'major', 
        successState: 'failed', 
        description: 'There is no test description',
        line: 'not ok',
        location: 'This is a server error', 
        message: 'This test has not been correctly implemented',
        yaml: this.generateYaml('This is a server error', 'This test has not been correctly implemented'),
        subtests: {list: [], type: 'subtest'},
    };
    constructor(description: string, type?: 'subtest'){
        if (type === 'subtest') {
            this.testInformation.type = 'subtest'
        } else {
            testSuite.list.push(this);
        }
        this.testInformation.description = description;
    }
    pass() {
        this.testInformation = {
            tap: 'ok ' +  this.testInformation.description,
            type: this.testInformation.type,
            successState: 'successful',
            description: this.testInformation.description,
            line: 'ok',
            subtests: this.testInformation.subtests,
        }
        if (this.testInformation.type === 'major'){
           this.testInformation.tap += generateTAP(this.testInformation.subtests)
        }
    }
    fail(location: string = 'Location not provided', message: string = 'No message provided') {
        this.testInformation = {
            tap: 'not ok ' + this.testInformation.description,
            type: this.testInformation.type, 
            successState: 'failed', 
            description: this.testInformation.description,
            line: 'not ok',
            location: location, 
            message: message,
            yaml: 'Yaml not generated',
            subtests: this.testInformation.subtests
        }        
        if (this.testInformation.type === 'major'){
            this.testInformation.tap += this.generateYaml(location, message)
            this.testInformation.tap += '\n' + generateTAP(this.testInformation.subtests)
        }
    }
    generateYaml(location: string, message: string){
        var yaml = '\n' +
            '    ---\n' +
            '    location: ' + location + '\n' +
            '    cause: ' + message + '\n' +
            '    ...';
        return yaml;
    }
    subtest(description: string){        
        var subtest = new Test(description, 'subtest')
        this.testInformation.subtests.list.push(subtest)
        return subtest
    }
}

function generateTAP(testlist: TestList<Test, 'major'|'subtest'>) {
    let indent: string = ''
    let tap: string = ''
    if (testlist.type === 'subtest') {        
        indent = '    '
        tap += '\n'
    } else {
        testlist = testSuite
    }
    if (testlist.list.length === 0) {
        return ''
    } else {
        tap += indent + '1..'+testlist.list.length+'\n'
        testlist.list.forEach(test => {
            tap += indent + (test.testInformation.tap + '\n')
        })
    }    
    return tap;
}

function generateHTML(tap: string) {
    tap = Parser.stringify(Parser.parse(generateTAP(testSuite), parserOptions))
    var lines = tap.split('\n');    
    var items: any = [];

    function generatePanel (line: string, index: number, disabled: boolean = false, color: string = '') {
        let subtests = generateSubpanels(index);
        items.push(<Panel key={index} header={disabled ? line + ' [succeeded]' : line} style={{background: color}} collapsible={disabled ? 'disabled' : 'header'}>{subtests}</Panel>)
    }

    function generateSubpanels (index: number) {
        let subtests: any = [];        
        let i = 1;
        if (lines[index+i].substring(0,1)==='#') lines.splice(index+i,1)
        while(/^\s/.test(lines[index+i].substring(0,3))){
            if (lines[index+i].substring(4,5)!=="1" && lines[index+i].substring(4,5)!=="#" && lines[index+i].substring(4,5)!=="-" && lines[index+i].substring(4,5)!==".")
            subtests.push(<code key={index+i} className={'linedcode'}>{lines[index+i]}</code>);
            i++;
        }
        return subtests;
    }

    
    lines.forEach((line, index) => {
        let tagtype: string = 'code'
        switch (tagtype) {
            case 'code':
                if (line.substring(0,3)=== 'not') {
                    generatePanel(line,index, false, '#fc5c65');
                } else if (line.substring(0,2)==='ok') {
                    generatePanel(line,index, true, '#26de81');
                }
                // items.push(<code className={'linedcode'} style={{color: linecolor}} key={index}>{line}</code>)
        }
        
    })
    return items;
}

function generateJSON(testlist: TestList<Test, 'major'>) {
    let jsons: Test[] = []
    testlist.list.forEach(test => {
        jsons.push(test)
    })
    return JSON.stringify(jsons);
}



var test1 = new Test('Multiplication of plus and plus');
var subtest1 = test1.subtest('This is a subtest');
var subtest2 = test1.subtest('This is a second subtest');

var test2 = new Test('Multiplication of plus and minus')
var test3 = new Test('Another fancy test')
var test4 = new Test('Another TODO test')

subtest1.pass()
subtest2.fail()

test1.pass()
test3.pass()
test2.fail('In your function that multiplies plus and minus', 'It seems like your multiplication does not work')
test4.fail()

generateHTML(generateTAP(testSuite));
console.log(generateJSON(testSuite));

// console.log(generateJSON(testSuite));


function ManualTapParser() {
    const { TextArea } = Input;
    const [input, setInput] = useState(generateTAP(testSuite));
    const [output, setOutput] = useState('Hit [Ctrl + Enter] in the left field to parse...');
    return (
        <div className="ManualTapParser">
            <Row>
                <Col span={12}>
                    <span className="in">
                        <TextArea rows={20} value={input} className="texta" onChange={(e)=>setInput(e.target.value)} onPressEnter={()=>setOutput(Parser.stringify(Parser.parse(input, parserOptions)))} />
                    </span>
                </Col>
                <Col span={12}>
                    <span className="out">
                        <TextArea rows={20} value={output} className="texta" />
                    </span>
                </Col>
            </Row>
            
            <div className={'taphtml'}>
                <Collapse accordion>
                    {generateHTML(generateTAP(testSuite))}
                </Collapse>
            </div>

            <div className="leftalign">
                <span className="title bold"><code>Test</code> class</span><br/>
                |<code> var mytest = new Test(description)</code>
                <span className="greyout"> – <code>description</code> has to be a string that describes the test</span><br/><br/>

                <span className="title bold"><code>.subtest()</code> method</span><span className="greyout"> – Can only be invoked from an existing test</span><br/>
                |<code> var mysubtest = mytest.subtest(description)</code>
                <span className="greyout"> – <code>description</code> has to be a string that describes the test</span><br/><br/>

                <span className="title bold"><code>.pass()</code> method</span><br/>
                |<code> var mysubtest.pass()</code>
                <span className="greyout"> – Subtests have to be passed/failed before regular tests</span><br/>
                |<code> var mytest.pass()</code>
                <span className="greyout"> – Results in an "ok" TAP test</span><br/><br/>

                <span className="title bold"><code>.fail()</code> method</span><br/>
                |<code> .fail(location, message)</code><span className="greyout"> – Method takes three arguments</span><br/>
                <code>location | string</code><span className="greyout"> – Tells the end user where the test has failed</span><br/>
                <code>message | string</code><span className="greyout"> – Tells the user why the test has failed</span><br/>
                |<code> var mysubtest.fail(bool, string, string)</code>
                <span className="greyout"> – Subtests have to be passed/failed before regular tests</span><br/>
                |<code> var mytest.fail(bool, string, string)</code>
                <span className="greyout"> – Results in a "not ok" TAP test</span><br/><br/>

                <span className="title bold"><code>generateTAP(testlist)</code> function</span><br/>
                |<code> generateTAP(testlist)</code><span> – Returns a TAP-readable format of all previously created Test instances instide the <code>testlist</code> as a <code>string</code></span><br/><br/>

                <span className="title bold"><code>generateJSON(testlist)</code> function</span><br/>
                |<code> generateJSON(testlist)</code><span> – Returns a stringified JSON of all previously created Test instances instide the <code>testlist</code></span>

            </div><br/>

            <span>Example code below</span><br/><br/><br/><br/>

            <div className="leftalign">
                <span className="title">Commands used to produce the output in the left textarea above:</span><br/><br/>
                <code>| var test1 = new Test('Multiplication of plus and plus');<span className="greyout"># Create a new test with its description as attribute</span></code><br/>
                <code>| var subtest1 = test1.subtest('This is a subtest'); <span className="greyout"># Subtests can extend a test</span></code><br/>
                <code>| var subtest2 = test1.subtest('This is a second subtest');</code><br/><br/>
                <code>| var test2 = new Test('Multiplication of plus and minus')</code><br/>
                <code>| var test3 = new Test('Another fancy test')</code><br/>
                <code>| var test4 = new Test('Another TODO test')</code><br/><br/>
                <code>| subtest1.pass() <span className="greyout"># Subtests need to be evaluated before the regular test is evaluated</span></code><br/>
                <code>| subtest2.fail() <span className="greyout"># Details for failed subtests cannot be provided</span></code><br/><br/>
                <code>| test1.pass()</code><br/>
                <code>| test3.pass()</code><br/>
                <code>| test2.fail('In your function that multiplies plus and minus', 'It seems like your multiplication does not work')</code><br/>
                <code>| test4.fail() <span className="greyout"># The parameters of a fail are:location, message.</span></code><br/>
            </div>
        </div>
    );
}

export default ManualTapParser;