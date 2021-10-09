import { Input, Row, Col} from 'antd';
import { Test, testSuite } from './Test';
import {generateJSON, generateHtml, generateTAP} from './Functions'
import '../../css/ManualTapParser.css'
import 'antd/dist/antd.css';

const Parser = require('tap-parser');
const parserOptions = {omitVersion: true, passes: true};

var test1 = new Test('Multiplication of plus and plus');
var subtest1 = test1.subtest('This is a subtest');
var subtest2 = test1.subtest('This is a second subtest');

var test2 = new Test('Multiplication of plus and minus')
var test3 = new Test('Another fancy test')
var test4 = new Test('Another TODO test')

subtest1.pass()
subtest2.pass()

test1.pass()
test3.pass()
test2.fail()
test4.pass()

let parsed = Parser.stringify(Parser.parse(generateTAP(testSuite), parserOptions))
generateHtml(testSuite);
console.log(generateJSON(testSuite));


function ManualTapParser() {
    const { TextArea } = Input;
    return (
        <div className="ManualTapParser">
            <Row>
                <Col span={24} style={{padding:'30px'}}>
                    <span className="out">
                        <TextArea rows={22} value={parsed} className="texta" />
                    </span>
                </Col>
            </Row>   
            <Row>
                <Col span={24} className={'taphtml'}>
                    {generateHtml(testSuite)}
                </Col>
            </Row>            
            

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
                |<code> generateJSON(testlist)</code><span> – Returns a stringified JSON of all previously created Test instances instide the <code>testlist</code></span><br/><br/>

                <span className="title bold"><code>generateHtmlFromJson(testlist)</code> function</span><br/>
                |<code> generateJSON(testlist)</code><span> – Returns a stringified JSON of all previously created Test instances instide the <code>testlist</code></span>

            </div>
        </div>
    );
}

export default ManualTapParser;