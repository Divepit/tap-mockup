import { Row, Col, Button, Card, Divider} from 'antd';
import { Test, TestSuite } from './Test';
import { generateHtmlFromTestSuite, generateTapFromTestSuite, generateHtmlFromTapString, generateTestSuiteFromTapString } from './Functions'
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

test1.fail({Location: 'my location was provided', Message: 'my message was provided'})
test3.pass()
test2.pass()
test4.pass()

let parsed = Parser.stringify(Parser.parse(generateTapFromTestSuite(testSuite), parserOptions))

console.log(testSuite);

function ManualTapParser() {
    const [pureTap, changePureTap] = useState(parsed)
    function generateTestButtons () {
        let buttons: object[] = []
        testSuite.list.forEach((element, index) => {
            buttons.push(
                <div key={index}>
                        <span>Test {index+1} (currently {element.testInformation.successState}): </span>
                        <Button type="primary" style={{marginTop: '30px', marginLeft: '20px'}} onClick={() => {
                            element.pass()
                            generateHtmlFromTestSuite(testSuite)
                            changePureTap(Parser.stringify(Parser.parse(generateTapFromTestSuite(testSuite), parserOptions)))
                            }}>.pass()</Button>
                        <Button type="primary" style={{marginTop: '30px', marginLeft: '20px'}} onClick={() => {
                            element.fail()
                            generateHtmlFromTestSuite(testSuite)
                            changePureTap(Parser.stringify(Parser.parse(generateTapFromTestSuite(testSuite), parserOptions)))
                        }}>.fail()</Button>
                </div>
                        
            )
        });
        return buttons;
    }
    return (
        <div className="ManualTapParser">
            <Row style={{height: '50vh'}}>
                <Col span={12} style={{padding:'30px', color: 'white'}}>
                    <Card headStyle={{color: 'white'}}  title={'Pure TAP Output'} style={{textAlign: 'left', background: 'grey', color: 'white', height: '40vh', overflow: 'scroll', borderRadius: '10px'}}>
                        {generateHtmlFromTapString(pureTap, 'pure')}
                    </Card>       
                </Col>
                <Col style={{padding:'30px'}} span={12}>
                    <Card title={'Change Test evaluations'} style={{height: '40vh'}} extra={'Test 1 has one failing and one passing subtest'}>
                        {generateTestButtons()}
                    </Card>
                </Col>
            </Row>
            <Row style={{height: '50vh', overflow: 'scroll'}} >
                <Col span={12}>
                    <Card className={''} title={'Generating HTML from JSON'}>
                        {generateHtmlFromTestSuite(testSuite)}
                    </Card>
                </Col>
                
                <Col span={12}>
                    <Card  className={''} title={'Generating HTML from TAP String'}>
                        {generateHtmlFromTestSuite(generateTestSuiteFromTapString(pureTap))}
                    </Card>
                </Col>
            </Row>
            {/* <Row style={{height: '50vh'}} >
                <Col span={24}>
                    <Card className={''} title={'Generating HTML from JSON'}>
                        {generateHtml(tapToTestSuite(pureTap))}
                    </Card>
                </Col>
            </Row>                 */}
            <br />
            <Divider />
            <br />

            <div className="leftalign">
                
                 <span className="title bold"><code>TestSuite</code> class</span><br/>
                |<code> var testSuite = new TestSuite(type: 'major' | 'subtest')</code>
                <span className="greyout"> – <code>type</code> has to be a string that labels the testtype (either 'major' or 'subtest')</span><br/><br/>

                <span className="title bold"><code>Test</code> class</span><br/>
                |<code> var mytest = new Test(testsuite: TestSuite, description: string)</code>
                <span className="greyout"> – <code>description</code> has to be a string that describes the test, <code>testuite</code> has to be a TestSuite object.</span><br/><br/>

                <span className="title bold"><code>.subtest(description: string)</code> method</span><span className="greyout"> – Can only be invoked from an existing test</span><br/>
                |<code> var mysubtest = mytest.subtest(description)</code>
                <span className="greyout"> – <code>description</code> has to be a string that describes the test</span><br/><br/>

                <span className="title bold"><code>.pass()</code> method</span><br/>
                |<code> var mysubtest.pass()</code>
                <span className="greyout"> – Subtests have to be passed/failed before regular tests</span><br/>
                |<code> var mytest.pass()</code>
                <span className="greyout"> – Results in an "ok" TAP test</span><br/><br/>

                <span className="title bold"><code>.fail(attributes: object)</code> method</span><br/>
                |<code> .fail(attributes)</code><span className="greyout"> – Method takes one argument</span><br/>
                <code>attributes | object</code><span className="greyout"> – Object with attributes which will be listed as error descriptions</span><br/>
                |<code> var mysubtest.fail(attributes)</code>
                <span className="greyout"> – Subtests have to be passed/failed before regular tests</span><br/>
                |<code> var mytest.fail(attributes)</code>
                <span className="greyout"> – Results in a "not ok" TAP test</span><br/><br/>

                <span className="title bold"><code>generateTapFromTestSuite(testlist: TestSuite)</code> function</span><br/>
                |<code> generateTapFromTestSuite(testlist)</code><span className="greyout"> – Returns a TAP-readable format of all previously created Test instances instide the <code>testlist</code> as a <code>string</code></span><br/><br/>

                <span className="title bold"><code>generateJsonFromTestSuite(testlist: TestSuite)</code> function</span><br/>
                |<code> generateJsonFromTestSuite(testlist)</code><span className="greyout"> – Returns a stringified JSON of all previously created Test instances instide the <code>testlist</code></span><br/><br/>

                <span className="title bold"><code>generateHtmlFromTestSuite(testlist: TestSuite)</code> function</span><br/>
                |<code> generateHtmlFromTestSuite(testlist)</code><span className="greyout"> – Returns a react component with a summary of all evaluated Test instances instide the <code>testlist</code></span><br /><br />
                
                <span className="title bold"><code>generateHtmlFromTapString(tap: string)</code> function</span><br/>
                |<code> generateHtmlFromTapString(testlist)</code><span className="greyout"> – Returns a react component with a summary of all evaluated Test instances instide the <code>testlist</code></span><br /><br />

                <span className="title bold"><code>generateTestSuiteFromTapString(tap: string)</code> function</span><br/>
                |<code> generateTestSuiteFromTapString(tap)</code><span className="greyout"> – Returns a <code>TestList</code> instance generated from a string of parsed TAP</span>

            </div>
        </div>
    );
}

export default ManualTapParser;