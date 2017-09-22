import React, {Component} from 'react';
import {
  Form,
  Input,
  Select,
  Icon
} from 'antd';
import {getTransformOptions} from '../services/logkit';
import config from '../store/config'
import moment from 'moment'
import _ from "lodash";

const Option = Select.Option
const FormItem = Form.Item;

const formItemLayout = {
  labelCol: {
    xs: {span: 24},
    sm: {span: 7},
  },
  wrapperCol: {
    xs: {span: 24},
    sm: {span: 10},
  },
};

const optionFormItemLayout = {
  labelCol: {
    xs: {span: 24},
    sm: {span: 7},
  },
  wrapperCol: {
    xs: {span: 24},
    sm: {span: 10},
  },
};

class Transformer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      current: 0,
      items: [],
      options: [],
      currentOption: '',
      currentItem: [],
      tags: [],
      transforms: {}
    }
    this.schemaUUID = 0;
  }

  componentDidMount() {
    this.init()
  }

  componentWillUnmount() {
  }

  componentDidUpdate(prevProps) {
    this.submit()
  }

  submit = () => {
    config.set('transforms', _.values(this.state.transforms))
  }


  init = () => {

    getTransformOptions().then(data => {
      if (data.success) {
        let options = _.keys(_.omit(data, 'success'))
        this.setState({
          options: options,
          currentOption: options[0],
          items: data,
          currentItem: data[options[0]]
        })
      }
    })


  }

  renderTags = () => {
    const {getFieldDecorator, getFieldValue} = this.props.form;

    return this.state.tags.map((k, index) => {
      return (
          <div key={`spec.fields.${k}`} style={{position: "relative"}}>
            <FormItem
                label={index === 0 ? '字段' : ''}
                className="inline fields key">
              {getFieldDecorator(`spec.${k}.key`, {
                rules: [{required: true, message: '目的字段不能为空'},
                  {min: 1, max: 100, message: '长度在 1 到 100 个字符'}]
              })(<Input disabled={true}/>)}
            </FormItem>
            <FormItem
                label={index === 0 ? '类型' : ''}
                className="inline fields value">
              {getFieldDecorator(`spec.${k}.type`, {
                rules: [{required: true, message: '目的字段不能为空'},
                  {min: 1, max: 100, message: '长度在 1 到 100 个字符'}]
              })(<Input disabled={true}/>)}
            </FormItem>
            <FormItem
                label={index === 0 ? '转化时机' : ''}
                className="inline fields value">
              {getFieldDecorator(`spec.${k}.stage`, {
                rules: [{required: true, message: '目的字段不能为空'},
                  {min: 1, max: 100, message: '长度在 1 到 100 个字符'}]
              })(<Input disabled={true}/>)}
            </FormItem>
            {
              this.state.isReadonly ? null :
                  <Icon
                      style={{marginTop: index === 0 ? "30px" : "0px"}}
                      className="dynamic-delete-button"
                      type="minus-circle-o"
                      onClick={() => this.removeTag(k)}
                  />
            }
          </div>
      )
    })
  };

  renderFormItem = () => {
    const {getFieldDecorator} = this.props.form;
    let result = []
    this.state.currentItem.map((ele, index) => {
      if (ele.ChooseOnly == false) {
        if (ele.KeyName == 'name') {
          ele.Default = "pandora.sender." + moment().format("YYYYMMDDHHmmss");
        }
        result.push(<FormItem key={index}
                              {...formItemLayout}
                              className=""
                              label={(
                                  <span className={ele.DefaultNoUse ? 'warningTip' : '' }>
                  {ele.Description}
                </span>
                              )}>
          {getFieldDecorator(`${this.state.currentOption}.${ele.KeyName}`, {
            initialValue: ele.Default,
            rules: [{required: ele.Default == '' ? false : true, message: '不能为空', trigger: 'blur'},
              {pattern: ele.CheckRegex, message: '输入不符合规范'},
            ]
          })(
              <Input placeholder={ele.DefaultNoUse ? ele.Default : '空值可作为默认值' } disabled={this.state.isReadonly}/>
          )}
        </FormItem>)
      } else {
        result.push(<FormItem key={index}
                              {...formItemLayout}
                              className=""
                              label={ele.Description}>
          {getFieldDecorator(`${this.state.currentOption}.${ele.KeyName}`, {
            initialValue: ele.ChooseOptions[0],
            rules: [{required: true, message: '不能为空', trigger: 'blur'},
            ]
          })(
              <Select>
                {this.renderChooseOption(ele.ChooseOptions)}
              </Select>
          )}
        </FormItem>)
      }

    })
    return (
        result
    )

  }

  handleChange = (option) => {
    this.setState({
      currentOption: option,
      currentItem: this.state.items[option]
    })

  }

  renderSelectOptions = () => {
    let options = []
    this.state.options.map((ele) => {
      options.push(<Option key={ele} value={ele}>{ele}</Option>)
    })
    return (
        options
    )
  }

  renderChooseOption = (items) => {
    let options = []
    items.map((ele) => {
      options.push(<Option key={ele} value={ele}>{ele}</Option>)
    })
    return (
        options
    )
  }

  addTag = () => {
    const {getFieldsValue, getFieldDecorator} = this.props.form;
    let data = getFieldsValue();
    this.setState({
      tags: this.state.tags.concat(`uuid${this.schemaUUID}`)
    });

    getFieldDecorator(`spec.${"uuid" + this.schemaUUID}.key`, {
      initialValue: data[this.state.currentOption].key,
      rules: [{required: true, message: '源字段不能为空'},
        {min: 1, max: 100, message: '长度在 1 到 100 个字符'}]
    });
    getFieldDecorator(`spec.${"uuid" + this.schemaUUID}.type`, {
      initialValue: data[this.state.currentOption].type,
      rules: [{required: true, message: '源字段不能为空'},
        {min: 1, max: 100, message: '长度在 1 到 100 个字符'}]
    });

    getFieldDecorator(`spec.${"uuid" + this.schemaUUID}.stage`, {
      initialValue: data[this.state.currentOption].stage,
      rules: [{required: true, message: '源字段不能为空'},
        {min: 1, max: 100, message: '长度在 1 到 100 个字符'}]
    });

    let transforms = this.state.transforms
    let key = "uuid" + this.schemaUUID
    _.set(transforms, key, data[this.state.currentOption]);
    this.setState({
      transforms
    })

    this.schemaUUID++;

  };

  removeTag = (k) => {
    this.setState({
      tags: this.state.tags.filter(key => key !== k),
      transforms: _.omit(this.state.transforms, k)
    });
  };

  render() {
    const {getFieldDecorator} = this.props.form;
    return (
        <div >
          <Form className="slide-in text-color">
            <FormItem {...optionFormItemLayout} label="选择需要转化的类型">
              {getFieldDecorator(`${this.state.currentOption}.type`, {
                initialValue: this.state.currentOption
              })(
                  <Select onChange={this.handleChange}>
                    {this.renderSelectOptions()}
                  </Select>)}
            </FormItem>
            {this.renderFormItem()}
            <FormItem label="需要转化的字段和类型" className="inline title"/>
            {this.renderTags()}
            <FormItem>
              <div style={{width: "140px", margin: "0px auto"}}>
                <button onClick={this.addTag} type="button"
                        className="btn btn-primary btn-add"
                        style={{width: "140px", marginBottom: "20px", marginTop: "10px"}}>添加
                </button>
              </div>
            </FormItem>
          </Form>
        </div>
    );
  }
}
export default Form.create()(Transformer);