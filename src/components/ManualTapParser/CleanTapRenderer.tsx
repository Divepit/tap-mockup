import { Input, Row, Col, Button, Card, Divider} from 'antd';
import { Test, TestSuite } from './Test';
import {generateJSON, generateHtml, generateTAP} from './Functions'
import '../../css/ManualTapParser.css'
import 'antd/dist/antd.css';
import { useState } from 'react';

const Parser = require('tap-parser');
const parserOptions = {omitVersion: true, passes: true};

var testSuite = new TestSuite('major')

var test1 = new Test(testSuite, 'Multiplication of plus and plus');
var subtest1 = test1.subtest('This is a subtest');
var subtest2 = test1.subtest('This is a second subtest');

var test2 = new Test(testSuite, 'Multiplication of plus and minus')
var test3 = new Test(testSuite, 'Another fancy test')
var test4 = new Test(testSuite, 'Another TODO test')

subtest1.pass()
subtest2.fail()

test1.pass()
test3.pass()
test2.pass()
test4.pass()

let parsed = Parser.stringify(Parser.parse(generateTAP(testSuite), parserOptions))
console.log(generateJSON(testSuite));

function ManualTapParser() {
    const { TextArea } = Input;
    const [pureTap, changePureTap] = useState(parsed)

    function generateTestButtons () {
        let buttons: object[] = []
        testSuite.list.forEach((element, index) => {
            buttons.push(
                <div key={index}>
                        <span>Test {index+1} (currently {element.testInformation.successState}): </span>
                        <Button type="primary" style={{marginTop: '30px', marginLeft: '20px'}} onClick={() => {
                            element.pass()
                            generateHtml(testSuite)
                            changePureTap(Parser.stringify(Parser.parse(generateTAP(testSuite), parserOptions)))
                            }}>.pass()</Button>
                        <Button type="primary" style={{marginTop: '30px', marginLeft: '20px'}} onClick={() => {
                            element.fail()
                            generateHtml(testSuite)
                            changePureTap(Parser.stringify(Parser.parse(generateTAP(testSuite), parserOptions)))
                        }}>.fail()</Button>
                </div>
                        
            )
        });
        return buttons;
    }
    return (
        <div className="ManualTapParser">
            <Row>
                <Col span={12} style={{padding:'30px'}}>
                    <span className="out">
                        <TextArea rows={22} value={pureTap} className="texta" />
                    </span>
                </Col>
                <Col style={{padding:'30px'}} span={12}>
                    <Card title={'Change Test evaluations'} extra={'Test 1 has one failing and one passing subtest'}>
                        {generateTestButtons()}
                    </Card>
                </Col>
            </Row>
            <Row>
                <Col span={24} className={'taphtml'}>
                    {generateHtml(testSuite)}
                </Col>
            </Row>            
            

            <div className="leftalign">
                
                 <span className="title bold"><code>TestSuite</code> class</span><br/>
                |<code> var testSuite = new TestSuite(type)</code>
                <span className="greyout"> – <code>type</code> has to be a string that labels the testtype (either 'major' or 'subtest')</span><br/><br/>

                <span className="title bold"><code>Test</code> class</span><br/>
                |<code> var mytest = new Test(testsuite, description)</code>
                <span className="greyout"> – <code>description</code> has to be a string that describes the test, <code>testuite</code> has to be a TestSuite object.</span><br/><br/>

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
                |<code> generateJSON(testlist)</code><span> – Returns a stringified JSON of all previously created Test instances instide the <code>testlist</code></span><br/><br/>

                <span className="title bold"><code>generateHtmlFromJson(testlist)</code> function</span><br/>
                |<code> generateHtmlFromJson(testlist)</code><span> – Returns a react component with a summary of all evaluated Test instances instide the <code>testlist</code></span>

            </div>
        </div>
    );
}

export default ManualTapParser;